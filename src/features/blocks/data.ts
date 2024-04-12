import { atom, useAtom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
// import { BlockMetadata } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { Buffer } from 'buffer'
import { algod, indexer } from '../common/data'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { transactionsAtom } from '../transactions/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { isDefined } from '@/utils/is-defined'
import { SubscribedTransaction } from '@algorandfoundation/algokit-subscriber/types/subscription'

export type BlockMetadata = {
  round: number
  timestamp: string
  parentTransactionCount: number
  transactionIds: string[]
}

// TODO: NC - Remove once https://github.com/algorandfoundation/algokit-subscriber-ts/pull/49 is merged
window.Buffer = Buffer

const syncedRoundAtom = atom<number | undefined>(undefined)

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
// The number key is the round
export const blocksAtom = atom<Map<number, BlockMetadata>>(new Map())

// TODO: NC - There is some duplication that will be cleaned up in the block refactor PR

const subscribeToBlocksEffect = atomEffect((get, set) => {
  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'all-transactions',
          filter: {
            customFilter: () => true,
          },
        },
      ],
      maxRoundsToSync: 1,
      waitForBlockWhenAtTip: true,
      syncBehaviour: 'skip-sync-newest',
      watermarkPersistence: {
        get: async () => get(syncedRoundAtom) ?? 0,
        set: async (watermark) => {
          set(syncedRoundAtom, watermark)
        },
      },
    },
    algod
  )

  subscriber.onPoll(async (result) => {
    // TODO: NC - Add this back in once subscriber supports it
    // const blocks = result.blockMetadata
    const transactions = result.subscribedTransactions.reduce((acc, t) => {
      if (!t.parentTransactionId) {
        // Filter out filtersMatched and balanceChanges, as we don't need them
        const { filtersMatched, balanceChanges, ...transaction } = t
        return acc.concat(transaction)
      }
      return acc
    }, [] as SubscribedTransaction[])

    const block = {
      round: result.syncedRoundRange[0],
      timestamp: new Date().toISOString(), // This is temporary
      parentTransactionCount: transactions.length,
      transactionIds: transactions.map((t) => t.id),
    } satisfies BlockMetadata

    if (block) {
      set(blocksAtom, (prev) => {
        return new Map([...prev, [block.round, block] as const])
      })
    }

    set(transactionsAtom, (prev) => {
      return new Map([...prev, ...transactions.map((t) => [t.id, t] as const)])
    })
  })

  subscriber.start()

  return async () => {
    await subscriber.stop('unmounted')
  }
})

export const useSyncedRound = () => {
  return useAtomValue(syncedRoundAtom)
}

export const useSubscribeToBlocksEffect = () => {
  useAtom(subscribeToBlocksEffect)
}

export const useLatestBlocks = () => {
  const store = useStore()
  const syncedRound = useAtomValue(syncedRoundAtom)

  return useMemo(() => {
    if (!syncedRound) {
      return []
    }
    const blocks = store.get(blocksAtom)
    return Array.from({ length: 5 }, (_, i) => {
      const round = syncedRound - i
      return blocks.has(round) ? blocks.get(round) : undefined
    }).filter(isDefined)
  }, [store, syncedRound])
}

const useBlockAtom = (round: number) => {
  const store = useStore()

  return useMemo(() => {
    const syncEffect = atomEffect((get, set) => {
      ;(async () => {
        try {
          const block = await get(fetchBlockAtom)
          set(blocksAtom, (prev) => {
            return new Map([
              ...prev,
              [
                block.round,
                {
                  round: block.round,
                  timestamp: new Date(block.timestamp * 1000).toISOString(),
                  parentTransactionCount: block.transactions?.length ?? 0,
                  transactionIds: block.transactions?.map((t: TransactionResult) => t.id) ?? [],
                } satisfies BlockMetadata,
              ] as const,
            ])
          })

          if (block.transactions && block.transactions.length > 0) {
            set(transactionsAtom, (prev) => {
              return new Map([...prev, ...block.transactions.map((t: TransactionResult) => [t.id, t] as const)])
            })
          }
        } catch (e) {
          // Ignore any errors as there is nothing to sync
        }
      })()
    })

    const fetchBlockAtom = atom(() => {
      return indexer.lookupBlock(round).do()
    })

    return atom((get) => {
      // store.get prevents the atom from being subscribed to changes in transactionsAtom
      const blocks = store.get(blocksAtom)
      const block = blocks.has(round) ? blocks.get(round) : undefined
      if (block) {
        return block
      }

      get(syncEffect)

      return get(fetchBlockAtom).then((result) => {
        return {
          round: result.round as number,
          timestamp: new Date(result.timestamp * 1000).toISOString(),
          parentTransactionCount: (result.transactions?.length as number) ?? 0,
          transactionIds: result.transactions?.map((t: TransactionResult) => t.id) ?? [],
        } satisfies BlockMetadata
      })
    })
  }, [store, round])
}

export const useLoadableBlock = (round: number) => {
  return useAtomValue(
    // Unfortunately we can't leverage Suspense here, as react doesn't support async useMemo inside the Suspense component
    // https://github.com/facebook/react/issues/20877
    loadable(useBlockAtom(round))
  )
}
