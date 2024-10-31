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
import { AsyncMaybeAtom } from '@/features/common/data/types'

const mapCommonAssetFreezeTransactionProperties = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
): BaseAssetFreezeTransaction => {
  invariant(transactionResult['asset-freeze-transaction'], 'asset-freeze-transaction is not set')
  const assetFreeze = transactionResult['asset-freeze-transaction']
  const assetId = assetFreeze['asset-id']
  const asset = assetResolver(assetId)

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetFreeze,
    subType: undefined,
    address: assetFreeze['address'],
    assetId,
    asset,
    freezeStatus: assetFreeze['new-freeze-status'] ? AssetFreezeStatus.Frozen : AssetFreezeStatus.Unfrozen,
  }
}

export const asAssetFreezeTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
): AssetFreezeTransaction => {
  return {
    id: transactionResult.id,
    ...mapCommonAssetFreezeTransactionProperties(transactionResult, assetResolver),
  }
}

export const asInnerAssetFreezeTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
): InnerAssetFreezeTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetFreezeTransactionProperties(transactionResult, assetResolver),
  }
}
