import { Transaction, TransactionType } from '@/features/transactions/models'
import { TransactionsSummary } from '../models'

export const asTransactionsSummary = (transactions: Pick<Transaction, 'type'>[]): TransactionsSummary => {
  return {
    count: transactions.length,
    countByType: Array.from(
      transactions
        .reduce((acc, transaction) => {
          const count = (acc.get(transaction.type) || 0) + 1
          return new Map([...acc, [transaction.type, count]])
        }, new Map<TransactionType, number>())
        .entries()
    ),
  }
}
