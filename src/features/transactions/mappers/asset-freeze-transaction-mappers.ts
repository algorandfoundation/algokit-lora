import { TransactionType } from '@algorandfoundation/algokit-utils/algokit_transact'
import { TransactionResult } from '@/features/transactions/data/types'
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
import { AssetId } from '@/features/assets/data/types'

const mapCommonAssetFreezeTransactionProperties = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>
): BaseAssetFreezeTransaction => {
  invariant(transactionResult.assetFreezeTransaction, 'asset-freeze-transaction is not set')
  const assetFreeze = transactionResult.assetFreezeTransaction
  const assetId = assetFreeze.assetId
  const asset = assetResolver(assetId)

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetFreeze,
    subType: undefined,
    address: assetFreeze['address'],
    assetId,
    asset,
    freezeStatus: assetFreeze.newFreezeStatus ? AssetFreezeStatus.Frozen : AssetFreezeStatus.Unfrozen,
  }
}

export const asAssetFreezeTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>
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
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>
): InnerAssetFreezeTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetFreezeTransactionProperties(transactionResult, assetResolver),
  }
}
