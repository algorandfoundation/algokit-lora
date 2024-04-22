import {
  ApplicationOnComplete,
  AssetResult,
  TransactionResult,
  TransactionSignature,
} from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import {
  AppCallOnComplete,
  AppCallTransactionModel,
  AssetTransferTransactionModel,
  AssetTransferTransactionSubType,
  BaseAppCallTransactionModel,
  BaseAssetTransferTransactionModel,
  BasePaymentTransactionModel,
  InnerAppCallTransactionModel,
  InnerAssetTransferTransactionModel,
  InnerPaymentTransactionModel,
  InnerTransactionId,
  LogicsigModel,
  MultisigModel,
  PaymentTransactionModel,
  SignatureType,
  SinglesigModel,
  TransactionSummary,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'
import * as algokit from '@algorandfoundation/algokit-utils'
import { asAsset } from '@/features/assets/mappers/asset-mappers'
import { ZERO_ADDRESS } from '@/features/common/constants'
import algosdk from 'algosdk'
import { getRecursiveDataForAppCallTransaction } from '../utils/get-recursive-data-for-app-call-transaction'
import { IndexerGlobalStateDelta, IndexerLocalStateDelta, asGlobalStateDelta, asLocalStateDelta } from './state-delta-mappers'

const mapCommonTransactionProperties = (transaction: TransactionResult) => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')

  return {
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    signature: transformSignature(transaction.signature),
    note: transaction.note,
    json: asJson(transaction),
  }
}

const mapCommonPaymentTransactionProperties = (transaction: TransactionResult) => {
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transaction),
    type: TransactionType.Payment,
    receiver: transaction['payment-transaction']['receiver'],
    amount: algokit.microAlgos(transaction['payment-transaction']['amount']),
    closeRemainder: transaction['payment-transaction']['close-remainder-to']
      ? {
          to: transaction['payment-transaction']['close-remainder-to'],
          amount: algokit.microAlgos(transaction['payment-transaction']['close-amount'] ?? 0),
        }
      : undefined,
  } satisfies BasePaymentTransactionModel
}

export const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  return {
    id: transaction.id,
    ...mapCommonPaymentTransactionProperties(transaction),
  }
}

export const asInnerPaymentTransaction = (
  networkTransactionId: string,
  index: string,
  transaction: TransactionResult
): InnerPaymentTransactionModel => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonPaymentTransactionProperties(transaction),
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

const mapCommonAssetTransferTransactionProperties = (transaction: TransactionResult, asset: AssetResult) => {
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
    ...mapCommonTransactionProperties(transaction),
    type: TransactionType.AssetTransfer,
    subType: subType(),
    asset: asAsset(asset),
    receiver: transaction['asset-transfer-transaction'].receiver,
    amount: transaction['asset-transfer-transaction'].amount,
    closeRemainder: transaction['asset-transfer-transaction']['close-to']
      ? {
          to: transaction['asset-transfer-transaction']['close-to'],
          amount: transaction['asset-transfer-transaction']['close-amount'] ?? 0,
        }
      : undefined,
    clawbackFrom: transaction['asset-transfer-transaction'].sender,
  } satisfies BaseAssetTransferTransactionModel
}

export const asAssetTransferTransaction = (transaction: TransactionResult, asset: AssetResult): AssetTransferTransactionModel => {
  return {
    id: transaction.id,
    ...mapCommonAssetTransferTransactionProperties(transaction, asset),
  }
}

export const asInnerAssetTransferTransactionModel = (
  networkTransactionId: string,
  index: string,
  transaction: TransactionResult,
  asset: AssetResult
): InnerAssetTransferTransactionModel => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetTransferTransactionProperties(transaction, asset),
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
      const assetIds = getRecursiveDataForAppCallTransaction(transaction, 'foreign-assets').filter((assetId) => assetId !== 0)
      const uniqueAssetIds = Array.from(new Set(assetIds))
      const assets = await Promise.all(uniqueAssetIds.map((assetId) => assetResolver(assetId)))
      return asAppCallTransaction(transaction, assets)
    }
    default:
      // TODO: Once we support all transaction types, we should throw an error instead
      // throw new Error(`${transaction['tx-type']} is not supported`)
      return asPlaceholderTransaction(transaction)
  }
}

export const asTransactionSummary = (transaction: TransactionResult): TransactionSummary => {
  const common = {
    id: transaction.id,
    from: transaction.sender,
  }

  switch (transaction['tx-type']) {
    case algosdk.TransactionType.pay:
      invariant(transaction['payment-transaction'], 'payment-transaction is not set')
      return {
        ...common,
        type: TransactionType.Payment,
        to: transaction['payment-transaction']['receiver'],
      }
    case algosdk.TransactionType.axfer: {
      invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
      return {
        ...common,
        type: TransactionType.AssetTransfer,
        to: transaction['asset-transfer-transaction']['receiver'],
      }
    }
    default:
      // TODO: Once we support all transaction types, we should throw an error instead
      // throw new Error(`${transaction['tx-type']} is not supported`)
      return {
        ...common,
        type: TransactionType.Payment,
        to: ZERO_ADDRESS,
      }
  }
}

export const asInnerTransactionMode = (
  networkTransactionId: string,
  index: string,
  transaction: TransactionResult,
  assetResults: AssetResult[]
) => {
  if (transaction['tx-type'] === AlgoSdkTransactionType.pay) {
    return asInnerPaymentTransaction(networkTransactionId, index, transaction)
  }
  if (transaction['tx-type'] === AlgoSdkTransactionType.axfer) {
    invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
    const assetResult = assetResults.find((asset) => asset.index === transaction['asset-transfer-transaction']!['asset-id'])
    invariant(assetResult, `Asset index ${transaction['asset-transfer-transaction']!['asset-id']} not found in cache`)

    return asInnerAssetTransferTransactionModel(networkTransactionId, index, transaction, assetResult)
  }
  if (transaction['tx-type'] === AlgoSdkTransactionType.appl) {
    return asInnerAppCallTransaction(networkTransactionId, index, transaction, assetResults)
  }

  // This could be dangerous as we haven't implemented all the transaction types
  throw new Error(`Unsupported inner transaction type: ${transaction['tx-type']}`)
}

const mapCommonAppCallTransactionProperties = (
  networkTransactionId: string,
  transaction: TransactionResult,
  assetResults: AssetResult[],
  indexPrefix?: string
) => {
  invariant(transaction['application-transaction'], 'application-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transaction),
    type: TransactionType.ApplicationCall,
    applicationId: transaction['application-transaction']['application-id'],
    applicationArgs: transaction['application-transaction']['application-args'] ?? [],
    applicationAccounts: Array.from(new Set(getRecursiveDataForAppCallTransaction(transaction, 'accounts'))),
    foreignApps: Array.from(new Set(getRecursiveDataForAppCallTransaction(transaction, 'foreign-apps'))),
    foreignAssets: Array.from(new Set(getRecursiveDataForAppCallTransaction(transaction, 'foreign-assets'))),
    globalStateDeltas: asGlobalStateDelta(transaction['global-state-delta'] as unknown as IndexerGlobalStateDelta[]),
    localStateDeltas: asLocalStateDelta(transaction['local-state-delta'] as unknown as IndexerLocalStateDelta[]),
    innerTransactions:
      transaction['inner-txns']?.map((innerTransaction, index) => {
        // Generate a unique id for the inner transaction
        const innerId = indexPrefix ? `${indexPrefix}-${index + 1}` : `${index + 1}`
        return asInnerTransactionMode(networkTransactionId, innerId, innerTransaction, assetResults)
      }) ?? [],
    onCompletion: asAppCallOnComplete(transaction['application-transaction']['on-completion']),
    action: transaction['application-transaction']['application-id'] ? 'Call' : 'Create',
    logs: transaction['logs'] ?? [],
  } satisfies BaseAppCallTransactionModel
}

export const asAppCallTransaction = (transaction: TransactionResult, assetResults: AssetResult[]): AppCallTransactionModel => {
  const commonProperties = mapCommonAppCallTransactionProperties(transaction.id, transaction, assetResults)

  return {
    id: transaction.id,
    ...commonProperties,
  }
}

export const asInnerAppCallTransaction = (
  networkTransactionId: string,
  index: string,
  transaction: TransactionResult,
  assetResults: AssetResult[]
): InnerAppCallTransactionModel => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAppCallTransactionProperties(networkTransactionId, transaction, assetResults, `${index}`),
  }
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

const asInnerTransactionId = (networkTransactionId: string, index: string): InnerTransactionId => {
  return {
    id: `${networkTransactionId}-${index}`,
    innerId: index,
  }
}
