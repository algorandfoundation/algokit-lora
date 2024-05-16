import { Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

export const extractTransactionsForAsset = (transaction: Transaction, assetIndex: number) => {
  const flattenedTransactions = flattenInnerTransactions(transaction)
  const results = []

  for (const { transaction } of flattenedTransactions) {
    if (transaction.type === TransactionType.AssetConfig && transaction.assetId === assetIndex) {
      results.push(transaction)
    }
    if (transaction.type === TransactionType.AssetTransfer && transaction.asset.id === assetIndex) {
      results.push(transaction)
    }
    if (transaction.type === TransactionType.AssetFreeze && transaction.assetId === assetIndex) {
      results.push(transaction)
    }
  }
  return results
}
