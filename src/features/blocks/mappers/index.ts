import { TransactionModel, TransactionType } from '@/features/transactions/models'
import { BlockModel } from '../models'
import { BlockResult } from '../data/types'

export const asBlock = (block: BlockResult, transactions: TransactionModel[], nextRoundAvailable: boolean): BlockModel => {
  return {
    round: block.round,
    previousRound: block.round > 0 ? block.round - 1 : undefined,
    nextRound: nextRoundAvailable ? block.round + 1 : undefined,
    timestamp: block.timestamp,
    transactionsSummary: {
      count: transactions.length,
      countByType: Array.from(
        transactions
          .reduce((acc, transaction) => {
            const count = (acc.get(transaction.type) || 0) + 1
            return new Map([...acc, [transaction.type, count]])
          }, new Map<TransactionType, number>())
          .entries()
      ),
    },
    transactions,
  }
}
