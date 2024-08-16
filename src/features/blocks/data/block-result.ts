import { atom, Getter, Setter } from 'jotai'
import { createReadOnlyAtomAndTimestamp, readOnlyAtomCache } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { transactionResultsAtom } from '@/features/transactions/data'
import { BlockResult, Round } from './types'
import { groupResultsAtom } from '@/features/groups/data'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { indexer } from '@/features/common/data/algo-client'

export const getBlockAndExtractData = async (round: Round) => {
  // We  use indexer instead of algod, as algod might not have the full history of blocks
  return await indexer
    .lookupBlock(round)
    .do()
    .then((result) => {
      const { transactions, ...block } = result
      const [transactionIds, groupResults] = ((transactions ?? []) as TransactionResult[]).reduce(
        (acc, t) => {
          // Accumulate transactions
          acc[0].push(t.id)

          // Accumulate group results
          accumulateGroupsFromTransaction(acc[1], t, block.round, block.timestamp)

          return acc
        },
        [[], new Map()] as [string[], Map<GroupId, GroupResult>]
      )

      return [
        {
          ...block,
          transactionIds,
        } as BlockResult,
        (transactions ?? []) as TransactionResult[],
        Array.from(groupResults.values()),
      ] as const
    })
}

export const accumulateGroupsFromTransaction = (
  acc: Map<GroupId, GroupResult>,
  transaction: TransactionResult,
  round: number,
  roundTime: number
) => {
  // Inner transactions can be part of a group, just like regular transactions.
  // In this scenario we add the root transaction id to the group, as inner transactions don't have ids on the network.
  flattenTransactionResult(transaction).forEach((txn) => {
    if (txn.group) {
      const group: GroupResult = acc.get(txn.group) ?? {
        id: txn.group,
        round,
        timestamp: new Date(roundTime * 1000).toISOString(),
        transactionIds: [],
      }
      if (!group.transactionIds.find((id) => id === transaction.id)) {
        group.transactionIds.push(transaction.id)
      }
      acc.set(txn.group, group)
    }
  })
}

export const addStateExtractedFromBlocksAtom = atom(
  null,
  (get, set, blockResults: BlockResult[], transactionResults: TransactionResult[], groupResults: GroupResult[]) => {
    if (transactionResults.length > 0) {
      const currentTransactionResults = get(transactionResultsAtom)
      const transactionResultsToAdd = transactionResults.filter((t) => !currentTransactionResults.has(t.id))
      set(transactionResultsAtom, (prev) => {
        const next = new Map(prev)
        transactionResultsToAdd.forEach((transactionResult) => {
          if (!next.has(transactionResult.id)) {
            next.set(transactionResult.id, createReadOnlyAtomAndTimestamp(transactionResult))
          }
        })
        return next
      })
    }

    if (groupResults.length > 0) {
      const currentGroupResults = get(groupResultsAtom)
      const groupResultsToAdd = groupResults.filter((groupResult) => !currentGroupResults.has(groupResult.id))
      set(groupResultsAtom, (prev) => {
        const next = new Map(prev)
        groupResultsToAdd.forEach((groupResult) => {
          if (!next.has(groupResult.id)) {
            next.set(groupResult.id, createReadOnlyAtomAndTimestamp(groupResult))
          }
        })
        return next
      })
    }

    if (blockResults.length > 0) {
      const currentBlockResults = get(blockResultsAtom)
      const blockResultsToAdd = blockResults.filter((blockResult) => !currentBlockResults.has(blockResult.round))
      set(blockResultsAtom, (prev) => {
        const next = new Map(prev)
        blockResultsToAdd.forEach((blockResult) => {
          if (!next.has(blockResult.round)) {
            next.set(blockResult.round, createReadOnlyAtomAndTimestamp(blockResult))
          }
        })
        return next
      })
    }
  }
)

const syncAssociatedDataAndReturnBlockResult = async (_: Getter, set: Setter, round: Round) => {
  const [blockResult, transactionResults, groupResults] = await getBlockAndExtractData(round)

  // Don't need to sync the block, as it's synced by atomsInAtom, due to this atom returning the block
  set(addStateExtractedFromBlocksAtom, [], transactionResults, groupResults)
  return blockResult
}

export const [blockResultsAtom, getBlockResultAtom] = readOnlyAtomCache(syncAssociatedDataAndReturnBlockResult, (round) => round)
