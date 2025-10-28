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

  if (transaction.type !== TransactionType.AppCall) {
    return results
  }

  const inners = transaction.innerTransactions.flatMap((transaction) => flattenInnerTransactions(transaction, nestingLevel + 1)) ?? []
  return results.concat(inners)
}
