import { atom } from 'jotai'
import { indexer } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { liveTransactionIdsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { BlockResult, Round } from './types'
import { groupResultsAtom } from '@/features/groups/data'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'

export const syncedRoundAtom = atom<Round | undefined>(undefined)

export const createBlockExtractAtom = (round: Round) => {
  return atom(async (_get) => {
    // We  use indexer instead of algod, as algod might not have the full history of blocks
    const result = await indexer
      .lookupBlock(round)
      .do()
      .then((result) => {
        const [transactionIds, groupResults] = ((result.transactions ?? []) as TransactionResult[]).reduce(
          (acc, t) => {
            acc[0].push(t.id)
            if (t.group) {
              const group: GroupResult = acc[1].get(t.group) ?? {
                id: t.group,
                round: result.round as number,
                timestamp: new Date(result.timestamp * 1000).toISOString(),
                transactionIds: [],
              }
              group.transactionIds.push(t.id)
              acc[1].set(t.group, group)
            }
            return acc
          },
          [[], new Map()] as [string[], Map<GroupId, GroupResult>]
        )

        return [
          {
            round: result.round as number,
            timestamp: new Date(result.timestamp * 1000).toISOString(),
            transactionIds,
          } as BlockResult,
          (result.transactions ?? []) as TransactionResult[],
          Array.from(groupResults.values()),
        ] as const
      })

    return result
  })
}

export const addStateExtractFromBlocksAtom = atom(
  null,
  (get, set, blockResults: BlockResult[], transactionResults: TransactionResult[], groupResults: GroupResult[]) => {
    if (transactionResults.length > 0) {
      const currentTransactionResults = get(transactionResultsAtom)
      const transactionResultsToAdd = transactionResults.filter((t) => !currentTransactionResults.has(t.id))
      set(transactionResultsAtom, (prev) => {
        const next = new Map(prev)
        transactionResultsToAdd.forEach((transactionResult) => {
          if (!next.has(transactionResult.id)) {
            next.set(transactionResult.id, atom(transactionResult))
          }
        })
        return next
      })

      set(liveTransactionIdsAtom, (prev) => {
        return Array.from(transactionResults.map((txn) => txn.id)).concat(prev)
      })
    }

    if (groupResults.length > 0) {
      const currentGroupResults = get(groupResultsAtom)
      const groupResultsToAdd = groupResults.filter((groupResult) => !currentGroupResults.has(groupResult.id))
      set(groupResultsAtom, (prev) => {
        const next = new Map(prev)
        groupResultsToAdd.forEach((groupResult) => {
          if (!next.has(groupResult.id)) {
            next.set(groupResult.id, atom(groupResult))
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
            next.set(blockResult.round, atom(blockResult))
          }
        })
        return next
      })
    }
  }
)

const createBlockResultAtom = (round: Round) => {
  const blockExtractAtom = createBlockExtractAtom(round)

  const syncStateExtractedFromBlockEffect = atomEffect((get, set) => {
    ;(async () => {
      const [_, transactionResults, groupResults] = await get(blockExtractAtom).catch(() => {
        // Ignore any errors as the fetch operation has failed and we have nothing to sync
        return [null, [] as TransactionResult[], [] as GroupResult[]] as const
      })

      // Don't need to sync the block, as it's synced by atomsInAtom, due to this atom returning the block
      set(addStateExtractFromBlocksAtom, [], transactionResults, groupResults)
    })()
  })

  return atom<Promise<BlockResult> | BlockResult>(async (get) => {
    get(syncStateExtractedFromBlockEffect)
    const [blockResult] = await get(blockExtractAtom)
    return blockResult
  })
}

export const [blockResultsAtom, getBlockResultAtom] = atomsInAtom(createBlockResultAtom, (round) => round)
