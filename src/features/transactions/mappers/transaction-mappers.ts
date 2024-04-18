import {
  ApplicationOnComplete,
  AssetResult,
  EvalDelta,
  TransactionResult,
  TransactionSignature,
} from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType as AlgoSdkTransactionType, encodeAddress } from 'algosdk'
import {
  AppCallOnComplete,
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
import algosdk from 'algosdk'
import { getRecursiveDataForAppCallTransaction } from '../utils/get-recursive-data-for-app-call-transaction'
import isUtf8 from 'isutf8'
import { Buffer } from 'buffer'

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
    amount: algokit.microAlgos(transaction['payment-transaction']['amount']),
    closeRemainder: transaction['payment-transaction']['close-remainder-to']
      ? {
          to: transaction['payment-transaction']['close-remainder-to'],
          amount: algokit.microAlgos(transaction['payment-transaction']['close-amount'] ?? 0),
        }
      : undefined,
    signature: transformSignature(transaction.signature),
    note: transaction.note,
    json: asJson(transaction),
  }
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

const asJson = (transaction: TransactionResult) => JSON.stringify(transaction, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)

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
    json: asJson(transaction),
  }
}

// This creates a placeholder transaction for transactions that we don't support yet
// TODO: Remove this code, once we support all transaction types
export const asPlaceholderTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  return {
    id: transaction.id,
    type: TransactionType.Payment,
    confirmedRound: transaction['confirmed-round']!,
    roundTime: transaction['round-time']! * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: ZERO_ADDRESS,
    amount: algokit.microAlgos(3141592),
    signature: transformSignature(transaction.signature),
    note: transaction.note,
    json: '{ "placeholder": true }',
  }
}

export const asTransactionModel = async (
  transaction: TransactionResult,
  assetResolver: (assetId: number) => Promise<AssetResult> | AssetResult
) => {
  switch (transaction['tx-type']) {
    case algosdk.TransactionType.pay:
      return asPaymentTransaction(transaction)
    case algosdk.TransactionType.axfer: {
      invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
      const assetId = transaction['asset-transfer-transaction']['asset-id']
      const asset = await assetResolver(assetId)
      return asAssetTransferTransaction(transaction, asset)
    }
    case algosdk.TransactionType.appl: {
      invariant(transaction['application-transaction'], 'application-transaction is not set')
      const assetIds = getRecursiveDataForAppCallTransaction(transaction, 'foreign-assets')
      const assets = await Promise.all(assetIds.map((assetId) => assetResolver(assetId)))
      return asAppCallTransaction(transaction, assets)
    }
    default:
      // TODO: Once we support all transaction types, we should throw an error instead
      return asPlaceholderTransaction(transaction)
    // throw new Error(`${transaction['tx-type']} is not supported`)
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
    globalStateDeltas: asStateDelta(transaction['global-state-delta'] as unknown as IndexerStateDelta[]),
    localStateDeltas: asStateDelta(transaction['local-state-delta'] as unknown as IndexerStateDelta[]),
    innerTransactions:
      transaction['inner-txns']?.map((innerTransaction, index) => {
        // Generate a unique id for the inner transaction
        innerTransaction.id = `Inner ${index + 1}`
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
    onCompletion: asAppCallOnComplete(transaction['application-transaction']['on-completion']),
    action: transaction['application-transaction']['application-id'] ? 'Call' : 'Create',
    json: asJson(transaction),
  }
}

// I am very certain that the Record<string, EvalDelta> type in indexer is wrong
// This is to fix it
type IndexerStateDelta = {
  key: string
  value: EvalDelta
}

const asStateDelta = (stateDelta: IndexerStateDelta[] | undefined): StateDelta[] => {
  if (!stateDelta) {
    return []
  }

  const getKey = (key: string): string => {
    const buffer = Buffer.from(key, 'base64')

    if (isUtf8(buffer)) {
      return buffer.toString()
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

  return stateDelta.map((record): StateDelta => {
    const key = record.key
    const state = record.value

    return {
      key: getKey(key),
      type: getType(state),
      action: getAction(state),
      value: getValue(state),
    }
  })
}

const asAppCallOnComplete = (indexerEnum: ApplicationOnComplete): AppCallOnComplete => {
  switch (indexerEnum) {
    case ApplicationOnComplete.noop:
      return AppCallOnComplete.NoOp
    case ApplicationOnComplete.optin:
      return AppCallOnComplete.OptIn
    case ApplicationOnComplete.closeout:
      return AppCallOnComplete.CloseOut
    case ApplicationOnComplete.clear:
      return AppCallOnComplete.ClearState
    case ApplicationOnComplete.update:
      return AppCallOnComplete.Update
    case ApplicationOnComplete.delete:
      return AppCallOnComplete.Delete
  }
}
