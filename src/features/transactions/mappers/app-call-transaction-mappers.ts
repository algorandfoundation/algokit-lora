import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
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
import { Asset } from '@/features/assets/models'
import { asInnerAssetConfigTransaction } from './asset-config-transaction-mappers'

const mapCommonAppCallTransactionProperties = (
  networkTransactionId: string,
  transactionResult: TransactionResult,
  assets: Asset[],
  indexPrefix?: string
) => {
  invariant(transactionResult['application-transaction'], 'application-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.ApplicationCall,
    applicationId: transactionResult['application-transaction']['application-id'],
    applicationArgs: transactionResult['application-transaction']['application-args'] ?? [],
    applicationAccounts: transactionResult['application-transaction'].accounts ?? [],
    foreignApps: transactionResult['application-transaction']['foreign-apps'] ?? [],
    foreignAssets: transactionResult['application-transaction']['foreign-assets'] ?? [],
    globalStateDeltas: asGlobalStateDelta(transactionResult['global-state-delta'] as unknown as IndexerGlobalStateDelta[]),
    localStateDeltas: asLocalStateDelta(transactionResult['local-state-delta'] as unknown as IndexerLocalStateDelta[]),
    innerTransactions:
      transactionResult['inner-txns']?.map((innerTransaction, index) => {
        // Generate a unique id for the inner transaction
        const innerId = indexPrefix ? `${indexPrefix}-${index + 1}` : `${index + 1}`
        return asInnerTransactionModel(networkTransactionId, innerId, innerTransaction, assets)
      }) ?? [],
    onCompletion: asAppCallOnComplete(transactionResult['application-transaction']['on-completion']),
    action: transactionResult['application-transaction']['application-id'] ? 'Call' : 'Create',
    logs: transactionResult['logs'] ?? [],
  } satisfies BaseAppCallTransactionModel
}

export const asAppCallTransaction = (transactionResult: TransactionResult, assets: Asset[]): AppCallTransactionModel => {
  const commonProperties = mapCommonAppCallTransactionProperties(transactionResult.id, transactionResult, assets)

  return {
    id: transactionResult.id,
    ...commonProperties,
  }
}

export const asInnerAppCallTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assets: Asset[]
): InnerAppCallTransactionModel => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAppCallTransactionProperties(networkTransactionId, transactionResult, assets, `${index}`),
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

const asInnerTransactionModel = (networkTransactionId: string, index: string, transactionResult: TransactionResult, assets: Asset[]) => {
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.pay) {
    return asInnerPaymentTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.axfer) {
    invariant(transactionResult['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
    const assetResult = assets.find((asset) => asset.id === transactionResult['asset-transfer-transaction']!['asset-id'])
    invariant(assetResult, `Asset index ${transactionResult['asset-transfer-transaction']!['asset-id']} not found in cache`)

    return asInnerAssetTransferTransactionModel(networkTransactionId, index, transactionResult, assetResult)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.appl) {
    return asInnerAppCallTransaction(networkTransactionId, index, transactionResult, assets)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.acfg) {
    return asInnerAssetConfigTransaction(networkTransactionId, index, transactionResult)
  }

  // This could be dangerous as we haven't implemented all the transaction types
  throw new Error(`Unsupported inner transaction type: ${transactionResult['tx-type']}`)
}
