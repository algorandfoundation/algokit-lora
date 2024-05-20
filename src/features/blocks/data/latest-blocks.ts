import { atom, useAtom, useAtomValue } from 'jotai'
import { isDefined } from '@/utils/is-defined'
import { asBlockSummary } from '../mappers'
import { liveTransactionIdsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { asTransactionSummary } from '@/features/transactions/mappers'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { algod } from '@/features/common/data'
import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { BlockResult, Round } from './types'
import { assetMetadataResultsAtom } from '@/features/assets/data'
import algosdk from 'algosdk'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { distinct } from '@/utils/distinct'
import { assetResultsAtom } from '@/features/assets/data'
import { BlockSummary } from '../models'
import { blockResultsAtom, addStateExtractedFromBlocksAtom } from './block-result'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { AssetId } from '@/features/assets/data/types'
import { BalanceChangeRole } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { accountResultsAtom } from '@/features/accounts/data'
import { Address } from '@/features/accounts/data/types'
import { ApplicationId } from '@/features/applications/data/types'
import { applicationResultsAtom } from '@/features/applications/data'
import { syncedRoundAtom } from './synced-round'

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

    const [blockTransactionIds, transactionResults, groupResults, staleAssetIds, staleAddresses, staleApplicationIds] =
      result.subscribedTransactions.reduce(
        (acc, t) => {
          if (!t.parentTransactionId && t['confirmed-round'] != null) {
            const round = t['confirmed-round']
            // Remove filtersMatched, balanceChanges and arc28Events, as we don't need to store them in the transaction
            const { filtersMatched: _filtersMatched, balanceChanges, arc28Events: _arc28Events, ...transaction } = t

            // Accumulate transaction ids by round
            acc[0].set(round, (acc[0].get(round) ?? []).concat(transaction.id))

            // Accumulate transactions
            acc[1].push(transaction)

            // Accumulate group results
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

            // Accumulate stale asset ids
            const staleAssetIds = flattenTransactionResult(t)
              .filter((t) => t['tx-type'] === algosdk.TransactionType.acfg)
              .map((t) => t['asset-config-transaction']!['asset-id'])
              .filter(distinct((x) => x))
              .filter(isDefined) // We ignore asset create transactions because they aren't in the atom
            acc[3].push(...staleAssetIds)

            // Accumulate stale addresses
            const addressesStaleDueToBalanceChanges =
              balanceChanges
                ?.filter((bc) => {
                  const isAssetOptIn =
                    bc.amount === 0n &&
                    bc.assetId !== 0 &&
                    bc.roles.includes(BalanceChangeRole.Sender) &&
                    bc.roles.includes(BalanceChangeRole.Receiver)
                  const isNonZeroAmount = bc.amount !== 0n // Can either be negative (decreased balance) or positive (increased balance)
                  return isAssetOptIn || isNonZeroAmount
                })
                .map((bc) => bc.address)
                .filter(distinct((x) => x)) ?? []
            const addressesStaleDueToAppChanges = flattenTransactionResult(t)
              .filter((t) => {
                if (t['tx-type'] !== algosdk.TransactionType.appl) {
                  return false
                }
                const appCallTransaction = t['application-transaction']!
                const isAppCreate =
                  appCallTransaction['on-completion'] === ApplicationOnComplete.noop && !appCallTransaction['application-id']
                const isAppOptIn =
                  appCallTransaction['on-completion'] === ApplicationOnComplete.optin && appCallTransaction['application-id']
                return isAppCreate || isAppOptIn
              })
              .map((t) => t.sender)
              .filter(distinct((x) => x))
            const staleAddresses = Array.from(new Set(addressesStaleDueToBalanceChanges.concat(addressesStaleDueToAppChanges)))
            acc[4].push(...staleAddresses)

            const staleApplicationIds = flattenTransactionResult(t)
              .filter((t) => t['tx-type'] === algosdk.TransactionType.appl)
              .map((t) => t['application-transaction']?.['application-id'])
              .filter(distinct((x) => x))
              .filter(isDefined) // We ignore application create transactions because they aren't in the atom
            acc[5].push(...staleApplicationIds)
          }
          return acc
        },
        [new Map(), [], new Map(), [], [], []] as [
          Map<Round, string[]>,
          TransactionResult[],
          Map<GroupId, GroupResult>,
          AssetId[],
          Address[],
          ApplicationId[],
        ]
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

    if (staleAddresses.length > 0) {
      const currentAccountResults = get.peek(accountResultsAtom)
      const addressesToRemove = staleAddresses.filter((staleAddress) => currentAccountResults.has(staleAddress))

      set(accountResultsAtom, (prev) => {
        const next = new Map(prev)
        addressesToRemove.forEach((address) => {
          next.delete(address)
        })
        return next
      })
    }

    if (staleApplicationIds.length > 0) {
      const currentApplicationResults = get.peek(applicationResultsAtom)
      const applicationIdsToRemove = staleApplicationIds.filter((staleApplicationId) => currentApplicationResults.has(staleApplicationId))

      set(applicationResultsAtom, (prev) => {
        const next = new Map(prev)
        applicationIdsToRemove.forEach((applicationId) => {
          next.delete(applicationId)
        })
        return next
      })
    }

    set(addStateExtractedFromBlocksAtom, blockResults, transactionResults, Array.from(groupResults.values()))

    set(liveTransactionIdsAtom, (prev) => {
      return transactionResults.map((txn) => txn.id).concat(prev)
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
