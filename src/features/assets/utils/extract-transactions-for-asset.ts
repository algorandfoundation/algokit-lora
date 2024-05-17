import { Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { AssetId } from '../data/types'

export const extractTransactionsForAsset = (transaction: Transaction, assetId: AssetId) => {
  const flattenedTransactions = flattenInnerTransactions(transaction)
  const results = []

  for (const { transaction } of flattenedTransactions) {
    if (transaction.type === TransactionType.AssetConfig && transaction.assetId === assetId) {
      results.push(transaction)
    }
    if (transaction.type === TransactionType.AssetTransfer && transaction.asset.id === assetId) {
      results.push(transaction)
    }
    if (transaction.type === TransactionType.AssetFreeze && transaction.assetId === assetId) {
      results.push(transaction)
    }
  }
  return results
}
