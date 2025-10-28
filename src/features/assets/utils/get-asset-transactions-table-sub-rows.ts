import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { AssetId } from '../data/types'

export const getAssetTransactionsTableSubRows = (assetId: AssetId, transaction: Transaction | InnerTransaction) => {
  if (transaction.type !== TransactionType.AppCall || transaction.innerTransactions.length === 0) {
    return []
  }

  return transaction.innerTransactions.filter((innerTransaction) => {
    const txns = flattenInnerTransactions(innerTransaction)
    return txns.some(({ transaction }) => {
      return (
        (transaction.type === TransactionType.AssetTransfer && transaction.assetId === assetId) ||
        (transaction.type === TransactionType.AssetConfig && transaction.assetId === assetId) ||
        (transaction.type === TransactionType.AssetFreeze && transaction.assetId === assetId)
      )
    })
  })
}
