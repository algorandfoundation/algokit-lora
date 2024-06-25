import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Block, BlockSummary, CommonBlockProperties } from '../models'
import { BlockResult } from '../data/types'
import { asTransactionsSummary } from '@/features/transactions/mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'

const asCommonBlock = (block: BlockResult, transactions: Pick<Transaction, 'type'>[]): CommonBlockProperties => {
  const { ['transaction-ids']: _, ...rest } = block
  const transactionsWithJson = transactions as Transaction[]
  const transactionsWithoutJson = transactionsWithJson.map(({ json, ...restTransaction }) => ({ ...restTransaction }))

  return {
    round: block.round,
    timestamp: new Date(block.timestamp * 1000).toISOString(),
    transactionsSummary: asTransactionsSummary(transactions),
    json: { ...rest, transactions: transactionsWithoutJson },
  }
}

export const asBlockSummary = (block: BlockResult, transactions: TransactionSummary[]): BlockSummary => {
  return { ...asCommonBlock(block, transactions), transactions }
}

export const asBlock = (block: BlockResult, transactions: Transaction[], nextRound: AsyncMaybeAtom<number>): Block => {
  return {
    ...asCommonBlock(block, transactions),
    previousRound: block.round > 0 ? block.round - 1 : undefined,
    nextRound,
    transactions,
  }
}
