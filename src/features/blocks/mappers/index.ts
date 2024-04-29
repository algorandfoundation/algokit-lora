import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Block, BlockSummary, CommonBlockProperties } from '../models'
import { BlockResult } from '../data/types'
import { asTransactionsSummary } from '@/features/common/mappers'

const asCommonBlock = (block: BlockResult, transactions: Pick<Transaction, 'type'>[]): CommonBlockProperties => {
  return {
    round: block.round,
    timestamp: block.timestamp,
    transactionsSummary: asTransactionsSummary(transactions),
  }
}

export const asBlockSummary = (block: BlockResult, transactions: TransactionSummary[]): BlockSummary => {
  return { ...asCommonBlock(block, transactions), transactions }
}

export const asBlock = (block: BlockResult, transactions: Transaction[], nextRoundAvailable: boolean): Block => {
  return {
    ...asCommonBlock(block, transactions),
    previousRound: block.round > 0 ? block.round - 1 : undefined,
    nextRound: nextRoundAvailable ? block.round + 1 : undefined,
    transactions,
  }
}
