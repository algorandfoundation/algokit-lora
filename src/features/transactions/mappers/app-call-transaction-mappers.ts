import { ApplicationOnComplete, AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AppCallOnComplete,
  AppCallTransactionModel,
  BaseAppCallTransactionModel,
  InnerAppCallTransactionModel,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { IndexerGlobalStateDelta, IndexerLocalStateDelta, asGlobalStateDelta, asLocalStateDelta } from './state-delta-mappers'
import { mapCommonTransactionProperties, asInnerTransactionId } from './transaction-common-properties-mappers'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { asInnerPaymentTransaction } from './payment-transaction-mappers'
import { asInnerAssetTransferTransactionModel } from './asset-transfer-transaction-mappers'

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
    applicationAccounts: transaction['application-transaction'].accounts ?? [],
    foreignApps: transaction['application-transaction']['foreign-apps'] ?? [],
    foreignAssets: transaction['application-transaction']['foreign-assets'] ?? [],
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

const asInnerTransactionMode = (
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
