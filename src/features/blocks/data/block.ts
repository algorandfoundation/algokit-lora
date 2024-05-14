import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { indexer } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { fetchTransactionResultsAtomBuilder, fetchTransactionsAtomBuilder, transactionResultsAtom } from '@/features/transactions/data'
import { asBlock } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { blockResultsAtom, syncedRoundAtom } from './core'
import { BlockResult, Round } from './types'
import { groupResultsAtom } from '@/features/groups/data/core'
import { GroupId, GroupResult } from '@/features/groups/data/types'

const nextRoundAvailableAtomBuilder = (store: JotaiStore, round: Round) => {
  // This atom conditionally subscribes to updates on the syncedRoundAtom
  return atom((get) => {
    const syncedRoundSnapshot = store.get(syncedRoundAtom)
    const syncedRound = syncedRoundSnapshot && round >= syncedRoundSnapshot ? get(syncedRoundAtom) : syncedRoundSnapshot
    return syncedRound ? syncedRound > round : true
  })
}

export const fetchBlockResultAtomBuilder = (round: Round) => {
  return atom(async (_get) => {
    return await indexer
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
  })
}

export const syncBlockAtomEffectBuilder = (fetchBlockResultAtom: ReturnType<typeof fetchBlockResultAtomBuilder>) => {
  return atomEffect((get, set) => {
    ;(async () => {
      try {
        const [blockResult, transactionResults, groupResults] = await get(fetchBlockResultAtom)

        if (transactionResults.length > 0) {
          set(transactionResultsAtom, (prev) => {
            const next = new Map(prev)
            transactionResults.forEach((t) => {
              next.set(t.id, t)
            })
            return next
          })
        }

        if (groupResults.size > 0) {
          set(groupResultsAtom, (prev) => {
            const next = new Map(prev)
            groupResults.forEach((g) => {
              next.set(g.id, g)
            })
            return next
          })
        }

        set(blockResultsAtom, (prev) => {
          const next = new Map(prev)
          next.set(blockResult.round, blockResult)
          return next
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const getBlockAtomBuilder = (store: JotaiStore, round: Round) => {
  const fetchBlockResultAtom = fetchBlockResultAtomBuilder(round)
  const syncEffect = syncBlockAtomEffectBuilder(fetchBlockResultAtom)

  return atom(async (get) => {
    const blockResults = store.get(blockResultsAtom)
    const cachedBlockResult = blockResults.get(round)
    const nextRoundAvailable = get(nextRoundAvailableAtomBuilder(store, round))
    if (cachedBlockResult) {
      const transactions = await get(
        fetchTransactionsAtomBuilder(store, fetchTransactionResultsAtomBuilder(store, cachedBlockResult.transactionIds))
      )
      return asBlock(cachedBlockResult, transactions, nextRoundAvailable)
    }

    get(syncEffect)

    const [blockResult, transactionResults] = await get(fetchBlockResultAtom)
    const transactions = await get(fetchTransactionsAtomBuilder(store, transactionResults))
    return asBlock(blockResult, transactions, nextRoundAvailable)
  })
}

const useBlockAtom = (round: Round) => {
  const store = useStore()

  return useMemo(() => {
    return getBlockAtomBuilder(store, round)
  }, [store, round])
}

export const useLoadableBlock = (round: Round) => {
  return useAtomValue(loadable(useBlockAtom(round)))
}
