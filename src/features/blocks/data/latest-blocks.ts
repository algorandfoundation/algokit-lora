import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { isDefined } from '@/utils/is-defined'
import { asBlockSummary } from '../mappers'
import { transactionResultsAtom } from '@/features/transactions/data'
import { asTransactionSummary } from '@/features/transactions/mappers/transaction-mappers'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { algod } from '@/features/common/data'
import { TransactionId } from '@/features/transactions/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { blockResultsAtom, syncedRoundAtom } from './core'
import { BlockResult, Round } from './types'
import { assetMetadataResultsAtom } from '@/features/assets/data'
import algosdk from 'algosdk'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { distinct } from '@/utils/distinct'
import { assetResultsAtom } from '@/features/assets/data'
import { BlockSummary } from '../models'
import { atomWithDefault } from 'jotai/utils'

const maxBlocksToDisplay = 5

// TODO: NC - This needs fixing, I'll come back to this
const createLatestBlockSummariesAtom = (_store: JotaiStore) => {
  const dataAtom = atomWithDefault<BlockSummary[]>((get) => {
    get(setDataEffect)
    return []
  })

  const setDataEffect = atomEffect((get, set) => {
    const syncedRound = get(syncedRoundAtom)
    if (!syncedRound) {
      return
    }

    const blockResults = get.peek(blockResultsAtom)
    const transactionResults = get.peek(transactionResultsAtom)

    ;(async () => {
      const latestBlockSummaries = (
        await Promise.all(
          Array.from({ length: maxBlocksToDisplay }, async (_, i) => {
            const round = syncedRound - i
            const block = blockResults.get(round)

            if (block) {
              const transactionSummaries = await Promise.all(
                block.transactionIds.map(async (transactionId) => {
                  const transactionResult = await get(transactionResults.get(transactionId)!)

                  return asTransactionSummary(transactionResult)
                })
              )

              return asBlockSummary(block, transactionSummaries)
            }
          })
        )
      ).filter(isDefined)

      set(dataAtom, latestBlockSummaries)
    })()
  })

  return dataAtom
}

export const useLatestBlockSummariesAtom = (store: JotaiStore) => {
  return useMemo(() => {
    return createLatestBlockSummariesAtom(store)
  }, [store])
}

export const useLatestBlockSummaries = () => {
  const store = useStore()
  return useAtomValue(useLatestBlockSummariesAtom(store))
}

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

          acc[0].set(round, (acc[0].get(round) ?? []).concat(transaction.id))
          acc[1].set(transaction.id, transaction)
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

    set(transactionResultsAtom, (prev) => {
      const next = new Map(prev)
      transactions.forEach((value, key) => {
        next.set(key, atom(value))
      })
      return next
    })

    transactions.forEach((t) => {
      const affectedAssetIds = flattenTransactionResult(t)
        .filter((t) => t['tx-type'] === algosdk.TransactionType.acfg)
        .map((t) => t['asset-config-transaction']!['asset-id'])
        .filter(distinct((x) => x))
        .filter(isDefined) // We ignore asset create transactions because they aren't in the atom

      affectedAssetIds.forEach(async (assetId) => {
        // Invalidate any asset caches that are stale because of this transaction

        if (get.peek(assetMetadataResultsAtom).has(assetId)) {
          set(assetMetadataResultsAtom, (prev) => {
            const next = new Map(prev)
            next.delete(assetId)
            return next
          })
        }

        if (get.peek(assetResultsAtom).has(assetId)) {
          set(assetResultsAtom, (prev) => {
            const next = new Map(prev)
            next.delete(assetId)
            return next
          })
        }
      })
    })

    set(blockResultsAtom, (prev) => {
      const next = new Map(prev)
      blocks.forEach(([key, value]) => {
        next.set(key, value)
      })
      return next
    })
  })

  subscriber.start()

  return async () => {
    await subscriber.stop('unmounted')
  }
})

export const useSubscribeToBlocksEffect = () => {
  useAtom(subscribeToBlocksEffect)
}
