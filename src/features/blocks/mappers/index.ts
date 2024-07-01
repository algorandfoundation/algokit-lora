import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Block, BlockSummary, CommonBlockProperties } from '../models'
import { BlockResult } from '../data/types'
import { asTransactionsSummary } from '@/features/transactions/mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { camelToKebabCase } from '@/features/common/data/camel-to-kebab-case'

const asCommonBlock = (block: BlockResult, transactions: Pick<Transaction, 'type'>[]): CommonBlockProperties => {
  const { transactionIds: _, ...rest } = block
  const transactionsWithJson = transactions as Transaction[]
  const transactionsWithoutJson = transactionsWithJson.map(({ json, ...restTransaction }) => ({ ...restTransaction }))

  const restWithKebabCaseKeys: Record<string, unknown> = {}
  for (const key in rest) {
    const kebabKey = camelToKebabCase(key)
    restWithKebabCaseKeys[kebabKey] = (rest as Record<string, unknown>)[key]
  }
  return {
    round: block.round,
    timestamp: new Date(block.timestamp * 1000).toISOString(),
    transactionsSummary: asTransactionsSummary(transactions),
    json: { ...restWithKebabCaseKeys, transactions: transactionsWithoutJson },
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
