import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Block, BlockSummary, CommonBlockProperties } from '../models'
import { BlockResult } from '../data/types'
import { asTransactionsSummary } from '@/features/transactions/mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

const asCommonBlock = (block: BlockResult, transactions: (Transaction | TransactionSummary)[]): CommonBlockProperties => {
  return {
    round: block.round,
    timestamp: new Date(block.timestamp * 1000).toISOString(),
    transactionsSummary: asTransactionsSummary(transactions),
  }
}

export const asBlockSummary = (block: BlockResult, transactions: TransactionSummary[]): BlockSummary => {
  return { ...asCommonBlock(block, transactions), transactions }
}

export const asBlock = (
  block: BlockResult,
  transactions: Transaction[],
  transactionResults: TransactionResult[],
  nextRound: AsyncMaybeAtom<number>
): Block => {
  const { transactionIds: _, ...rest } = block

  return {
    ...asCommonBlock(block, transactions),
    previousRound: block.round > 0 ? block.round - 1 : undefined,
    nextRound,
    transactions,
    json: { ...rest, transactions: transactionResults },
  }
}
