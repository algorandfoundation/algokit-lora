import { atom, useAtom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { isDefined } from '@/utils/is-defined'
import { BlockResult, Round } from './types'
import { fetchTransactionsAtomBuilder, fetchTransactionsModelAtomBuilder, transactionsAtom } from '@/features/transactions/data'
import { algod, indexer } from '@/features/common/data'
import { asBlock } from '../mappers'
import { JotaiStore } from '@/features/common/data/types'
import { TransactionId } from '@/features/transactions/data/types'

const maxBlocksToDisplay = 5
const syncedRoundAtom = atom<Round | undefined>(undefined)

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const blocksAtom = atom<Map<Round, BlockResult>>(new Map())

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
    if (!result.blockMetadata || result.blockMetadata.length < 1) {
      return
    }

    const [blockTransactionIds, transactions] = result.subscribedTransactions.reduce(
      (acc, t) => {
        if (!t.parentTransactionId && t['confirmed-round']) {
          // Filter out filtersMatched and balanceChanges, as we don't need them
          const { filtersMatched, balanceChanges, ...transaction } = t
          const round = transaction['confirmed-round']!

          return [
            new Map<Round, string[]>([...acc[0], [round, (acc[0].get(round) ?? []).concat(transaction.id)]]),
            new Map<TransactionId, TransactionResult>([...acc[1], [transaction.id, transaction]]),
          ] as const
        }
        return acc
      },
      [new Map<Round, string[]>(), new Map<TransactionId, TransactionResult>()] as const
    )

    const blocks = result.blockMetadata.map((b) => {
      return [
        b.round,
        {
          round: b.round,
          timestamp: b.timestamp,
          transactionIds: blockTransactionIds.get(b.round) ?? [],
        } as BlockResult,
      ] as const
    })

    set(blocksAtom, (prev) => {
      return new Map([...prev, ...blocks])
    })

    set(transactionsAtom, (prev) => {
      return new Map([...prev, ...transactions])
    })
  })

  subscriber.start()

  return async () => {
    await subscriber.stop('unmounted')
  }
})

const nextRoundAvailableAtomBuilder = (store: JotaiStore, round: Round) => {
  // This atom conditionally subscribes to updates on the syncedRoundAtom
  return atom((get) => {
    const syncedRoundSnapshot = store.get(syncedRoundAtom)
    const syncedRound = syncedRoundSnapshot && round >= syncedRoundSnapshot ? get(syncedRoundAtom) : syncedRoundSnapshot
    return syncedRound ? syncedRound > round : true
  })
}

const fetchBlockModelAtomBuilder = (store: JotaiStore, round: Round) => {
  const fetchBlockAtom = atom(async (_get) => {
    return await indexer
      .lookupBlock(round)
      .do()
      .then((result) => {
        return [
          {
            round: result.round as number,
            timestamp: new Date(result.timestamp * 1000).toISOString(),
            transactionIds: result.transactions?.map((t: TransactionResult) => t.id) ?? [],
          } as BlockResult,
          (result.transactions ?? []) as TransactionResult[],
        ] as const
      })
  })

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const [block, transactions] = await get(fetchBlockAtom)

        if (transactions && transactions.length > 0) {
          set(transactionsAtom, (prev) => {
            return new Map([...prev, ...transactions.map((t: TransactionResult) => [t.id, t] as const)])
          })
        }

        set(blocksAtom, (prev) => {
          return new Map([...prev, [block.round, block]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const blocks = store.get(blocksAtom)
    const cachedBlock = blocks.get(round)
    const nextRoundAvailable = get(nextRoundAvailableAtomBuilder(store, round))
    if (cachedBlock) {
      const transactions = await get(
        fetchTransactionsModelAtomBuilder(store, fetchTransactionsAtomBuilder(store, cachedBlock.transactionIds))
      )
      return asBlock(cachedBlock, transactions, nextRoundAvailable)
    }

    get(syncEffect)

    const [fetchedBlock, fetchedBlockTransactions] = await get(fetchBlockAtom)
    const transactions = await get(fetchTransactionsModelAtomBuilder(store, fetchedBlockTransactions))
    return asBlock(fetchedBlock, transactions, nextRoundAvailable)
  })
}

const useBlockAtom = (round: Round) => {
  const store = useStore()

  return useMemo(() => {
    return fetchBlockModelAtomBuilder(store, round)
  }, [store, round])
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
    return Array.from({ length: maxBlocksToDisplay }, (_, i) => {
      const round = syncedRound - i
      return blocks.get(round)
    }).filter(isDefined)
  }, [store, syncedRound])
}

export const useLoadableBlock = (round: Round) => {
  return useAtomValue(loadable(useBlockAtom(round)))
}
