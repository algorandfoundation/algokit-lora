import { Transaction } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

export const extractTransactionsForAccount = (transaction: Transaction) => {
  const flattenedTransactions = flattenInnerTransactions(transaction)
  const results = []

  for (const { transaction } of flattenedTransactions) {
    results.push(transaction)
  }
  return results
}
