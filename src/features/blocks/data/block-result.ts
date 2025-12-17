import { atom, Getter, Setter } from 'jotai'
import { createReadOnlyAtomAndTimestamp, readOnlyAtomCache } from '@/features/common/data'
import { transactionResultsAtom } from '@/features/transactions/data'
import { BlockResult, Round } from './types'
import { groupResultsAtom } from '@/features/groups/data'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { indexer } from '@/features/common/data/algo-client'
import { TransactionResult } from '@/features/transactions/data/types'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { indexerTransactionToTransactionResult } from '@/features/transactions/mappers/indexer-transaction-mappers'

export const getBlockAndExtractData = async (round: Round) => {
  // We  use indexer instead of algod, as algod might not have the full history of blocks
  const result = await indexer.lookupBlock(round)
  const { transactions, ...block } = result
  const [transactionIds, groupResults] = (transactions ?? [])
    .map((txn) => indexerTransactionToTransactionResult(txn))
    .reduce(
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
      timestamp: block.timestamp,
      transactionIds,
      txnCounter: block.txnCounter !== undefined ? BigInt(block.txnCounter) : undefined,
    } as BlockResult,
    (transactions ?? []).map((txn) => indexerTransactionToTransactionResult(txn)),
    Array.from(groupResults.values()),
  ] as const
}

export const accumulateGroupsFromTransaction = (
  acc: Map<GroupId, GroupResult>,
  transaction: TransactionResult,
  round: bigint,
  roundTime: number
) => {
  // Inner transactions can be part of a group, just like regular transactions.
  flattenTransactionResult(transaction).forEach((txn) => {
    const groupId = txn.group ? uint8ArrayToBase64(txn.group) : undefined
    if (groupId) {
      const group: GroupResult = acc.get(groupId) ?? {
        id: groupId,
        round,
        timestamp: new Date(roundTime * 1000).toISOString(),
        transactionIds: [],
      }
      if (!group.transactionIds.find((id) => id === txn.id)) {
        group.transactionIds.push(txn.id)
      }
      acc.set(groupId, group)
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
          if (transactionResult.id && !next.has(transactionResult.id)) {
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

const keySelector = (round: Round) => round

export const [blockResultsAtom, getBlockResultAtom] = readOnlyAtomCache<
  Parameters<typeof keySelector>,
  ReturnType<typeof keySelector>,
  Promise<BlockResult> | BlockResult
>(syncAssociatedDataAndReturnBlockResult, keySelector)
