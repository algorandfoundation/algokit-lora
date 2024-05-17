import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { AssetId } from '../data/types'

export const buildTransactionsTreeForAsset = (transaction: Transaction | InnerTransaction, assetId: AssetId) => {
  const results = []

  if (transaction.type === TransactionType.AssetConfig && transaction.assetId === assetId) {
    results.push(transaction)
  }
  if (transaction.type === TransactionType.AssetTransfer && transaction.asset.id === assetId) {
    results.push(transaction)
  }
  if (transaction.type === TransactionType.AssetFreeze && transaction.assetId === assetId) {
    results.push(transaction)
  }

  for (const { transaction } of flattenedTransactions) {
  }
  return results
}
