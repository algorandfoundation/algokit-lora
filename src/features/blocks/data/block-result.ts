import { atom } from 'jotai'
import { createAtomAndTimestamp } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { transactionResultsAtom } from '@/features/transactions/data'
import { BlockResult, Round } from './types'
import { groupResultsAtom } from '@/features/groups/data'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { atomsInAtom } from '@/features/common/data'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { indexer } from '@/features/common/data/algo-client'

export const getBlockAndExtractData = async (round: Round) => {
  // We  use indexer instead of algod, as algod might not have the full history of blocks
  const result = await indexer
    .lookupBlock(round)
    .do()
    .then((result) => {
      const [transactionIds, groupResults] = ((result.transactions ?? []) as TransactionResult[]).reduce(
        (acc, t) => {
          // Accumulate transactions
          acc[0].push(t.id)

          // Accumulate group results
          accumulateGroupsFromTransaction(acc[1], t, result.round, result.timestamp)

          return acc
        },
        [[], new Map()] as [string[], Map<GroupId, GroupResult>]
      )

      return [
        {
          round: result.round as number,
          timestamp: result.timestamp,
          genesisId: result['genesis-id'],
          genesisHash: result['genesis-hash'],
          ...(result['previous-block-hash'] ? { previousBlockHash: result['previous-block-hash'] } : undefined),
          seed: result.seed,
          ...(result['rewards']
            ? {
                rewards: {
                  feeSink: result['rewards']?.['fee-sink'],
                  rewardsLevel: result['rewards']?.['rewards-level'],
                  rewardsCalculationRound: result['rewards']?.['rewards-calculation-round'],
                  rewardsPool: result['rewards']?.['rewards-pool'],
                  rewardsResidue: result['rewards']?.['rewards-residue'],
                  rewardsRate: result['rewards']?.['rewards-rate'],
                },
              }
            : undefined),
          ...(result['upgrade-state']
            ? {
                upgradeState: {
                  currentProtocol: result['upgrade-state']['current-protocol'],
                  ...(result['upgrade-state']['next-protocol'] ? { nextProtocol: result['upgrade-state']['next-protocol'] } : undefined),
                  ...(result['upgrade-state']['next-protocol-approvals']
                    ? { nextProtocolApprovals: result['upgrade-state']['next-protocol-approvals'] }
                    : undefined),
                  ...(result['upgrade-state']['next-protocol-vote-before']
                    ? { nextProtocolVoteBefore: result['upgrade-state']['next-protocol-vote-before'] }
                    : undefined),
                  ...(result['upgrade-state']['next-protocol-switch-on']
                    ? { nextProtocolSwitchOn: result['upgrade-state']['next-protocol-switch-on'] }
                    : undefined),
                },
              }
            : undefined),
          transactionCounter: result['txn-counter'],
          transactionsRoot: result['transactions-root'],
          transactionsRootSha256: result['transactions-root-sha256'],
          transactionIds: transactionIds,
        } satisfies BlockResult,
        (result.transactions ?? []) as TransactionResult[],
        Array.from(groupResults.values()),
      ] as const
    })

  return result
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
            next.set(transactionResult.id, createAtomAndTimestamp(transactionResult))
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
            next.set(groupResult.id, createAtomAndTimestamp(groupResult))
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
            next.set(blockResult.round, createAtomAndTimestamp(blockResult))
          }
        })
        return next
      })
    }
  }
)

const syncAssociatedDataAndReturnBlockResultAtom = atom(null, async (_get, set, round: Round) => {
  const [blockResult, transactionResults, groupResults] = await getBlockAndExtractData(round)

  // Don't need to sync the block, as it's synced by atomsInAtom, due to this atom returning the block
  set(addStateExtractedFromBlocksAtom, [], transactionResults, groupResults)
  return blockResult
})

export const [blockResultsAtom, getBlockResultAtom] = atomsInAtom(syncAssociatedDataAndReturnBlockResultAtom, (round) => round)
