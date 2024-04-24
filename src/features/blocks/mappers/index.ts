import { TransactionModel, TransactionSummary, TransactionType } from '@/features/transactions/models'
import { Block, BlockSummary, CommonBlockProperties } from '../models'
import { BlockResult } from '../data/types'

const asCommonBlock = (block: BlockResult, transactions: Pick<TransactionModel, 'type'>[]): CommonBlockProperties => {
  return {
    round: block.round,
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
  }
}

export const asBlockSummary = (block: BlockResult, transactions: TransactionSummary[]): BlockSummary => {
  return { ...asCommonBlock(block, transactions), transactions }
}

export const asBlock = (block: BlockResult, transactions: TransactionModel[], nextRoundAvailable: boolean): Block => {
  return {
    ...asCommonBlock(block, transactions),
    previousRound: block.round > 0 ? block.round - 1 : undefined,
    nextRound: nextRoundAvailable ? block.round + 1 : undefined,
    transactions,
  }
}
