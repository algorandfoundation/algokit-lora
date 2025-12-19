import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { TransactionResult } from '@/features/transactions/data/types'
import { invariant } from '@/utils/invariant'
import { AssetId } from '@/features/assets/data/types'

export const getAssetIdsForTransaction = (transaction: TransactionResult): AssetId[] => {
  if (transaction.txType === TransactionType.AssetTransfer) {
    invariant(transaction.assetTransferTransaction, 'asset-transfer-transaction is not set')

    return [transaction.assetTransferTransaction.assetId]
  }
  if (transaction.txType === TransactionType.AppCall) {
    invariant(transaction.applicationTransaction, 'application-transaction is not set')

    const innerTransactions = transaction.innerTxns ?? []
    return innerTransactions.reduce((acc, innerTxn) => {
      const innerResult = getAssetIdsForTransaction(innerTxn)
      return acc.concat(innerResult)
    }, [] as bigint[])
  }
  if (transaction.txType === TransactionType.AssetConfig) {
    invariant(transaction.assetConfigTransaction, 'asset-config-transaction is not set')
    const assetId = transaction.assetConfigTransaction.assetId ? transaction.assetConfigTransaction.assetId : transaction.createdAssetIndex

    invariant(assetId != null, 'asset-id is not set')
    return [assetId]
  }
  if (transaction.txType === TransactionType.AssetFreeze) {
    invariant(transaction.assetFreezeTransaction, 'asset-freeze-transaction is not set')

    return [transaction.assetFreezeTransaction.assetId]
  }

  return []
}
