import { TransactionModel } from '@/features/transactions/models'

export type FlattenedTransaction = {
  nestingLevel: number
  transaction: TransactionModel
}

export function flattenInnerTransactions(transaction: TransactionModel, nestingLevel = 0): FlattenedTransaction[] {
  return [
    {
      nestingLevel,
      transaction,
    },
  ].concat(transaction.transactions?.flatMap((transaction) => flattenInnerTransactions(transaction, nestingLevel + 1)) ?? [])
}
