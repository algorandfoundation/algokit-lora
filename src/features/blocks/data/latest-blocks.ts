import { atom, useAtom, useAtomValue } from 'jotai'
import { isDefined } from '@/utils/is-defined'
import { asBlockSummary } from '../mappers'
import { transactionResultsAtom } from '@/features/transactions/data'
import { asTransactionSummary } from '@/features/transactions/mappers/transaction-mappers'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { algod } from '@/features/common/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { BlockResult, Round } from './types'
import { assetMetadataResultsAtom } from '@/features/assets/data'
import algosdk from 'algosdk'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { distinct } from '@/utils/distinct'
import { assetResultsAtom } from '@/features/assets/data'
import { BlockSummary } from '../models'
import { blockResultsAtom, updateBlockLinkedEntitiesAtom, syncedRoundAtom } from './block-result'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { AssetId } from '@/features/assets/data/types'

const maxBlocksToDisplay = 5

const createLatestBlockSummariesAtom = () => {
  const latestBlockSummariesAtom = atom<BlockSummary[]>([])
  const refreshLatestBlockSummariesEffect = atomEffect((get, set) => {
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
            const blockAtom = blockResults.get(round)

            if (blockAtom) {
              const block = await get(blockAtom)
              const transactionSummaries = await Promise.all(
                block.transactionIds.map(async (transactionId) => {
                  const transactionResult = await get.peek(transactionResults.get(transactionId)!)

                  return asTransactionSummary(transactionResult)
                })
              )

              return asBlockSummary(block, transactionSummaries)
            }
          })
        )
      ).filter(isDefined)

      set(latestBlockSummariesAtom, latestBlockSummaries)
    })()
  })

  return atom((get) => {
    get(refreshLatestBlockSummariesEffect)

    return get(latestBlockSummariesAtom)
  })
}

export const latestBlockSummariesAtom = createLatestBlockSummariesAtom()

export const useLatestBlockSummaries = () => {
  return useAtomValue(latestBlockSummariesAtom)
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

    const [blockTransactionIds, transactionResults, groupResults, staleAssetIds] = result.subscribedTransactions.reduce(
      (acc, t) => {
        if (!t.parentTransactionId && t['confirmed-round'] != null) {
          const round = t['confirmed-round']
          // Filter out filtersMatched and balanceChanges, as we don't need them
          const { filtersMatched, balanceChanges, ...transaction } = t

          acc[0].set(round, (acc[0].get(round) ?? []).concat(transaction.id))
          acc[1].push(transaction)
          if (t.group) {
            const roundTime = transaction['round-time']
            const group: GroupResult = acc[2].get(t.group) ?? {
              id: t.group,
              round: round,
              timestamp: (roundTime ? new Date(roundTime * 1000) : new Date()).toISOString(),
              transactionIds: [],
            }
            group.transactionIds.push(t.id)
            acc[2].set(t.group, group)
          }
          const staleAssetIds = flattenTransactionResult(t)
            .filter((t) => t['tx-type'] === algosdk.TransactionType.acfg)
            .map((t) => t['asset-config-transaction']!['asset-id'])
            .filter(distinct((x) => x))
            .filter(isDefined) // We ignore asset create transactions because they aren't in the atom
          acc[3].push(...staleAssetIds)
        }
        return acc
      },
      [new Map(), [], new Map(), []] as [Map<Round, string[]>, TransactionResult[], Map<GroupId, GroupResult>, AssetId[]]
    )

    const blockResults = result.blockMetadata.map((b) => {
      return {
        round: b.round,
        timestamp: b.timestamp,
        transactionIds: blockTransactionIds.get(b.round) ?? [],
      } as BlockResult
    })

    if (staleAssetIds.length > 0) {
      const currentAssetResults = get.peek(assetResultsAtom)
      const assetIdsToRemove = staleAssetIds.filter((staleAssetId) => currentAssetResults.has(staleAssetId))

      set(assetMetadataResultsAtom, (prev) => {
        const next = new Map(prev)
        assetIdsToRemove.forEach((assetId) => {
          next.delete(assetId)
        })
        return next
      })

      set(assetResultsAtom, (prev) => {
        const next = new Map(prev)
        assetIdsToRemove.forEach((assetId) => {
          next.delete(assetId)
        })
        return next
      })
    }

    set(updateBlockLinkedEntitiesAtom, blockResults, transactionResults, Array.from(groupResults.values()))
  })

  subscriber.start()

  return async () => {
    await subscriber.stop('unmounted')
  }
})

export const useSubscribeToBlocksEffect = () => {
  useAtom(subscribeToBlocksEffect)
}
