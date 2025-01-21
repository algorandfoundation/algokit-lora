import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Block, BlockSummary, CommonBlockProperties } from '../models'
import { BlockResult, Round } from '../data/types'
import { asTransactionsSummary } from '@/features/transactions/mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { asJson, normaliseAlgoSdkData } from '@/utils/as-json'
import { TransactionResult } from '@/features/transactions/data/types'
import { SubscribedTransaction } from '@algorandfoundation/algokit-subscriber/types/subscription'

const asCommonBlock = (block: BlockResult, transactions: (Transaction | TransactionSummary)[]): CommonBlockProperties => {
  return {
    round: block.round,
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
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
  nextRound: AsyncMaybeAtom<Round>
): Block => {
  const { transactionIds: _, ...rest } = block

  return {
    ...asCommonBlock(block, transactions),
    previousRound: block.round > 0 ? block.round - 1n : undefined,
    nextRound,
    transactions,
    json: asJson(
      normaliseAlgoSdkData({
        ...rest,
        ...(!rest.upgradeVote ? { upgradeVote: { upgradeApprove: false, upgradeDelay: 0 } } : undefined), // Match how indexer handles an undefined upgrade-vote
        transactions: transactionResults,
      })
    ),
    proposer: block.proposer,
  }
}

export const asTransactionResult = (subscribedTransaction: SubscribedTransaction): TransactionResult => {
  const {
    getEncodingSchema: _getEncodingSchema,
    toEncodingData: _toEncodingData,
    filtersMatched: _filtersMatched,
    balanceChanges: _balanceChanges,
    arc28Events: _arc28Events,
    ...transaction
  } = subscribedTransaction

  const innerTransactions = (transaction.innerTxns ?? []).map((innerTransaction) =>
    asInnerTransactionResult(innerTransaction, transaction.intraRoundOffset ?? 0)
  )

  return {
    ...transaction,
    innerTxns: innerTransactions,
  }
}

const asInnerTransactionResult = (subscribedTransaction: SubscribedTransaction, rootIntraRoundOffset: number): TransactionResult => {
  const {
    getEncodingSchema: _getEncodingSchema,
    toEncodingData: _toEncodingData,
    filtersMatched: _filtersMatched,
    balanceChanges: _balanceChanges,
    arc28Events: _arc28Events,
    id: _id,
    parentTransactionId: _parentTransactionId,
    ...transaction
  } = subscribedTransaction

  const innerTransactions = (transaction.innerTxns ?? []).map((innerTransaction) =>
    asInnerTransactionResult(innerTransaction, rootIntraRoundOffset)
  )
  return { ...transaction, intraRoundOffset: rootIntraRoundOffset, innerTxns: innerTransactions }
}
