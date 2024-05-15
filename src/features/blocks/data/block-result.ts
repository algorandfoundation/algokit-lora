import { atom } from 'jotai'
import { indexer } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { transactionResultsAtom } from '@/features/transactions/data'
import { BlockResult, Round } from './types'
import { groupResultsAtom } from '@/features/groups/data/core'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { atomFam } from '@/features/common/data/atom-fam'

export const syncedRoundAtom = atom<Round | undefined>(undefined)

export const createBlockResultAtom = (round: Round) => {
  // TODO: NC - Give this a good name
  const blockLinkedConceptsAtom = atom(async (_get) => {
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
          groupResults,
        ] as const
      })

    return result
  })

  const syncLinkedConceptsEffect = atomEffect((get, set) => {
    ;(async () => {
      const [_, transactionResults, groupResults] = await get(blockLinkedConceptsAtom).catch(() => {
        // Ignore any errors as the fetch operation has failed and we have nothing to sync
        return [null, [] as TransactionResult[], new Map<string, GroupResult>()] as const
      })

      if (transactionResults.length > 0) {
        set(transactionResultsAtom, (prev) => {
          const next = new Map(prev)
          transactionResults.forEach((t) => {
            if (!next.has(t.id)) {
              next.set(t.id, atom(t))
            }
          })
          return next
        })
      }

      if (groupResults.size > 0) {
        set(groupResultsAtom, (prev) => {
          const next = new Map(prev)
          groupResults.forEach((g) => {
            if (!next.has(g.id)) {
              next.set(g.id, g)
            }
          })
          return next
        })
      }
    })()
  })

  return atom<Promise<BlockResult> | BlockResult>(async (get) => {
    get(syncLinkedConceptsEffect)
    const [blockResult] = await get(blockLinkedConceptsAtom)
    return blockResult
  })
}

export const [blockResultsAtom, getBlockResultAtom] = atomFam((round) => round, createBlockResultAtom)
