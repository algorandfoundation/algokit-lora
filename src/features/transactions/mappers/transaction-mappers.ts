import { AssetResult, EvalDelta, TransactionResult, TransactionSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType as AlgoSdkTransactionType, encodeAddress } from 'algosdk'
import {
  AppCallTransactionModel,
  AssetTransferTransactionModel,
  AssetTransferTransactionSubType,
  LogicsigModel,
  MultisigModel,
  PaymentTransactionModel,
  SignatureType,
  SinglesigModel,
  StateDelta,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'
import * as algokit from '@algorandfoundation/algokit-utils'
import { asAsset } from '@/features/assets/mappers/asset-mappers'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { getRecursiveDataForAppCallTransaction } from '../utils/get-recursive-data-for-app-call-transaction'
import isUtf8 from 'isutf8'

export const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

  return {
    id: transaction.id,
    type: TransactionType.Payment,
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: transaction['payment-transaction']['receiver'],
    // TODO: NC - Remove isNaN check once this fix is merged and released. https://github.com/algorandfoundation/algokit-subscriber-ts/pull/49
    amount: algokit.microAlgos(!isNaN(transaction['payment-transaction']['amount']) ? transaction['payment-transaction']['amount'] : 0),
    closeRemainder: transaction['payment-transaction']['close-remainder-to']
      ? {
          to: transaction['payment-transaction']['close-remainder-to'],
          amount: algokit.microAlgos(transaction['payment-transaction']['close-amount'] ?? 0),
        }
      : undefined,
    signature: transformSignature(transaction.signature),
    note: transaction.note,
  } satisfies PaymentTransactionModel
}

const transformSignature = (signature?: TransactionSignature) => {
  if (signature?.sig) {
    return {
      type: SignatureType.Single,
      signer: signature.sig,
    } satisfies SinglesigModel
  }

  if (signature?.multisig) {
    return {
      type: SignatureType.Multi,
      version: signature.multisig.version,
      threshold: signature.multisig.threshold,
      subsigners: signature.multisig.subsignature.map((subsignature) => publicKeyToAddress(subsignature['public-key'])),
    } satisfies MultisigModel
  }

  if (signature?.logicsig) {
    return {
      type: SignatureType.Logic,
      logic: signature.logicsig.logic,
    } satisfies LogicsigModel
  }
}

export const asAssetTransferTransaction = (transaction: TransactionResult, asset: AssetResult): AssetTransferTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

  const subType = () => {
    invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

    if (transaction['asset-transfer-transaction']['close-to']) {
      return AssetTransferTransactionSubType.OptOut
    }
    if (
      transaction.sender === transaction['asset-transfer-transaction'].receiver &&
      transaction['asset-transfer-transaction'].amount === 0
    ) {
      return AssetTransferTransactionSubType.OptIn
    }
    if (
      transaction.sender === asset.params.clawback &&
      transaction['asset-transfer-transaction'].sender &&
      transaction['asset-transfer-transaction'].sender !== ZERO_ADDRESS
    ) {
      return AssetTransferTransactionSubType.Clawback
    }

    undefined
  }

  return {
    id: transaction.id,
    type: TransactionType.AssetTransfer,
    subType: subType(),
    asset: asAsset(asset),
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: transaction['asset-transfer-transaction'].receiver,
    amount: transaction['asset-transfer-transaction'].amount,
    closeRemainder: transaction['asset-transfer-transaction']['close-to']
      ? {
          to: transaction['asset-transfer-transaction']['close-to'],
          amount: transaction['asset-transfer-transaction']['close-amount'] ?? 0,
        }
      : undefined,
    signature: transformSignature(transaction.signature),
    clawbackFrom: transaction['asset-transfer-transaction'].sender,
  }
}

export const asAppCallTransaction = (transaction: TransactionResult, assetResults: AssetResult[]): AppCallTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['application-transaction'], 'application-transaction is not set')

  return {
    id: transaction.id,
    type: TransactionType.ApplicationCall,
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    signature: transformSignature(transaction.signature),
    note: transaction.note,
    applicationId: transaction['application-transaction']['application-id'],
    applicationArgs: transaction['application-transaction']['application-args'] ?? [],
    applicationAccounts: getRecursiveDataForAppCallTransaction(transaction, 'accounts'),
    foreignApps: getRecursiveDataForAppCallTransaction(transaction, 'foreign-apps'),
    foreignAssets: getRecursiveDataForAppCallTransaction(transaction, 'foreign-assets'),
    globalStateDeltas: asStateDelta(transaction['global-state-delta']),
    // TODO: the inner transactions don't have id
    innerTransactions:
      transaction['inner-txns']?.map((innerTransaction) => {
        if (innerTransaction['tx-type'] === AlgoSdkTransactionType.pay) {
          return asPaymentTransaction(innerTransaction)
        }
        if (innerTransaction['tx-type'] === AlgoSdkTransactionType.axfer) {
          invariant(innerTransaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
          const asset = assetResults.find((asset) => asset.index === innerTransaction['asset-transfer-transaction']!['asset-id'])
          invariant(asset, `Asset index ${innerTransaction['asset-transfer-transaction']!['asset-id']} not found in cache`)

          return asAssetTransferTransaction(innerTransaction, asset)
        }
        if (innerTransaction['tx-type'] === AlgoSdkTransactionType.appl) {
          return asAppCallTransaction(innerTransaction, assetResults)
        }

        // This could be dangerous as we haven't implemented all the transaction types
        throw new Error(`Unsupported inner transaction type: ${innerTransaction['tx-type']}`)
      }) ?? [],
  }
}

const asStateDelta = (stateDelta: Record<string, EvalDelta>[] | undefined): StateDelta[] => {
  if (!stateDelta) {
    return []
  }

  const getKey = (key: string): string => {
    const buffer = Buffer.from(key, 'base64')

    if (isUtf8(buffer)) {
      return key.toString()
    } else {
      return `0x${buffer.toString('hex')}`
    }
  }
  const getAction = (state: EvalDelta) => {
    if (state.action === 1 || state.action === 2) {
      return 'Set'
    }
    if (state.action === 3) {
      return 'Delete'
    }
    throw new Error(`Unsupported state action: ${state.action}`)
  }
  const getType = (state: EvalDelta) => {
    if (state.action === 1) return 'Bytes'
    if (state.action === 2) return 'Uint'
    if (state.action === 3) {
      if (state.bytes) return 'Bytes'
      return 'Uint'
    }
    throw new Error(`Unsupported state action: ${state.action}`)
  }
  const getValue = (state: EvalDelta) => {
    if (state.bytes) {
      const buf = Buffer.from(state.bytes, 'base64')
      if (buf.length === 32) {
        return encodeAddress(new Uint8Array(buf))
      } else {
        if (isUtf8(buf)) {
          return buf.toString('utf8')
        } else {
          return buf.toString('base64')
        }
      }
    }
    return state.uint?.toString() ?? ''
  }

  return stateDelta.map((delta): StateDelta => {
    const key = Object.keys(delta)[0]
    const state = delta.value

    return {
      key: getKey(key),
      type: getType(state),
      action: getAction(state),
      value: getValue(state),
    }
  })
}
