import { Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

export const extractTransactionsForAsset = (networkTransaction: Transaction, assetIndex: number) => {
  const flattenTransactions = flattenInnerTransactions(networkTransaction)
  const results = []

  for (const { transaction } of flattenTransactions) {
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
