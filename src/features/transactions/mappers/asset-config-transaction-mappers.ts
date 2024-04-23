import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetConfigTransactionModel, BaseAssetConfigTransactionModel, InnerAssetConfigTransactionModel, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonAssetConfigTransactionProperties = (transactionResult: TransactionResult) => {
  invariant(transactionResult['asset-config-transaction'], 'asset-config-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetConfig,
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
