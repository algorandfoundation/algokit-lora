import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AssetFreezeStatus,
  AssetFreezeTransaction,
  BaseAssetFreezeTransaction,
  InnerAssetFreezeTransaction,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { AssetSummary } from '@/features/assets/models'

const mapCommonAssetFreezeTransactionProperties = (
  transactionResult: TransactionResult,
  asset: AssetSummary
): BaseAssetFreezeTransaction => {
  invariant(transactionResult['asset-freeze-transaction'], 'asset-freeze-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetFreeze,
    address: transactionResult['asset-freeze-transaction']['address'],
    assetId: transactionResult['asset-freeze-transaction']['asset-id'],
    assetName: asset.name,
    freezeStatus: transactionResult['asset-freeze-transaction']['new-freeze-status']
      ? AssetFreezeStatus.Frozen
      : AssetFreezeStatus.Unfrozen,
  }
}

export const asAssetFreezeTransaction = (transactionResult: TransactionResult, asset: AssetSummary): AssetFreezeTransaction => {
  return {
    id: transactionResult.id,
    ...mapCommonAssetFreezeTransactionProperties(transactionResult, asset),
  }
}

export const asInnerAssetFreezeTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  asset: AssetSummary
): InnerAssetFreezeTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetFreezeTransactionProperties(transactionResult, asset),
  }
}
