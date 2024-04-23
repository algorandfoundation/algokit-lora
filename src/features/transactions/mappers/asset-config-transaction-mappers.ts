import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AssetConfigTransactionModel,
  AssetConfigTransactionSubType,
  BaseAssetConfigTransactionModel,
  InnerAssetConfigTransactionModel,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonAssetConfigTransactionProperties = (transactionResult: TransactionResult) => {
  invariant(transactionResult['asset-config-transaction'], 'asset-config-transaction is not set')
  invariant(transactionResult['asset-config-transaction']['params'], 'asset-config-transaction.params is not set')

  // TODO: how about delete?
  const subType = transactionResult['asset-config-transaction']['asset-id']
    ? AssetConfigTransactionSubType.Update
    : AssetConfigTransactionSubType.Create
  const assetId =
    subType === AssetConfigTransactionSubType.Update
      ? transactionResult['asset-config-transaction']['asset-id']
      : transactionResult['created-asset-index']

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetConfig,
    assetId: assetId!,
    name: transactionResult['asset-config-transaction']['params']['name'] ?? undefined,
    unitName: transactionResult['asset-config-transaction']['params']['unit-name'] ?? undefined,
    total: transactionResult['asset-config-transaction']['params']['total'] ?? undefined,
    decimals: transactionResult['asset-config-transaction']['params']['decimals'] ?? undefined,
    clawback: transactionResult['asset-config-transaction']['params']['clawback'] ?? undefined,
    subType: subType,
  } satisfies BaseAssetConfigTransactionModel
}

export const asAssetConfigTransaction = (transactionResult: TransactionResult): AssetConfigTransactionModel => {
  return {
    id: transactionResult.id,
    ...mapCommonAssetConfigTransactionProperties(transactionResult),
  }
}

export const asInnerAssetConfigTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult
): InnerAssetConfigTransactionModel => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetConfigTransactionProperties(transactionResult),
  }
}
