import { TransactionModel, TransactionType } from '@/features/transactions/models'

export type FlattenedTransaction = {
  nestingLevel: number
  transaction: TransactionModel
}

export function flattenInnerTransactions(transaction: TransactionModel, nestingLevel = 0): FlattenedTransaction[] {
  if (transaction.type !== TransactionType.ApplicationCall) {
    return [
      {
        nestingLevel,
        transaction,
      },
    ]
  }

  const inners: FlattenedTransaction[] =
    transaction.innerTransactions.flatMap((transaction) => flattenInnerTransactions(transaction, nestingLevel + 1)) ?? []

  return inners.concat([
    {
      nestingLevel,
      transaction,
    } satisfies FlattenedTransaction,
  ])
}
