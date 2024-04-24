import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'

export type FlattenedTransaction = {
  nestingLevel: number
  transaction: Transaction | InnerTransaction
}

// The name is not great
// This function returns the transaction + all inner transactions (including nested)
export function flattenInnerTransactions(transaction: Transaction | InnerTransaction, nestingLevel = 0): FlattenedTransaction[] {
  const results = [
    {
      nestingLevel,
      transaction,
    },
  ]

  if (transaction.type !== TransactionType.ApplicationCall) {
    return results
  }

  const inners: FlattenedTransaction[] =
    transaction.innerTransactions.flatMap((transaction) => flattenInnerTransactions(transaction, nestingLevel + 1)) ?? []
  results.push(...inners)

  return results
}
