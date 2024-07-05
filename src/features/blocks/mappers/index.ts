import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Block, BlockSummary, CommonBlockProperties } from '../models'
import { BlockResult } from '../data/types'
import { asTransactionsSummary } from '@/features/transactions/mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { convertKeysToKebabCase } from '@/features/common/data/camel-to-kebab-case'

const asCommonBlock = (block: BlockResult, transactions: (Transaction | TransactionSummary)[]): CommonBlockProperties => {
  const { transactionIds: _, ...restWithKebabCaseKeys } = convertKeysToKebabCase(block)
  const transactionsWithJson = transactions as Transaction[]
  const transactionsWithoutJsonKebabCaseKeys = transactionsWithJson
    .map(({ json, ...restTransaction }) => ({ ...restTransaction }))
    .map((transaction) => convertKeysToKebabCase(transaction))

  return {
    round: block.round,
    timestamp: new Date(block.timestamp * 1000).toISOString(),
    transactionsSummary: asTransactionsSummary(transactions),
    json: { ...restWithKebabCaseKeys, transactions: transactionsWithoutJsonKebabCaseKeys },
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
