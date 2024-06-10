import { atom, useAtom, useAtomValue } from 'jotai'
import { isDefined } from '@/utils/is-defined'
import { asBlockSummary } from '../mappers'
import { latestTransactionIdsAtom, getTransactionResultAtom } from '@/features/transactions/data'
import { asTransactionSummary } from '@/features/transactions/mappers'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { BlockResult, Round } from './types'
import { assetMetadataResultsAtom } from '@/features/assets/data'
import algosdk from 'algosdk'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { distinct } from '@/utils/distinct'
import { assetResultsAtom } from '@/features/assets/data'
import { BlockSummary } from '../models'
import { blockResultsAtom, addStateExtractedFromBlocksAtom, accumulateGroupsFromTransaction } from './block-result'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { AssetId } from '@/features/assets/data/types'
import { BalanceChangeRole } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { accountResultsAtom } from '@/features/accounts/data'
import { Address } from '@/features/accounts/data/types'
import { ApplicationId } from '@/features/applications/data/types'
import { applicationResultsAtom } from '@/features/applications/data'
import { syncedRoundAtom } from './synced-round'
import { algod } from '@/features/common/data/algo-client'
import { createTimestamp } from '@/features/common/data'

const maxBlocksToDisplay = 10

export const latestBlockSummariesAtom = atom<BlockSummary[]>([])
const refreshLatestBlockSummariesEffect = atomEffect((get, set) => {
  const syncedRound = get(syncedRoundAtom)
  if (!syncedRound) {
    return
  }

  const blockResults = get.peek(blockResultsAtom)

  ;(async () => {
    const latestBlockSummaries = (
      await Promise.all(
        Array.from({ length: maxBlocksToDisplay }, async (_, i) => {
          const round = syncedRound - i
          const blockResult = blockResults.get(round)
          if (blockResult) {
            const block = await get(blockResult[0])
            const transactionSummaries = await Promise.all(
              block.transactionIds.map(async (transactionId) => {
                const transactionResult = await get(getTransactionResultAtom(transactionId, { skipTimestampUpdate: true }))
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

export const useLatestBlockSummaries = () => {
  useAtom(refreshLatestBlockSummariesEffect)
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
      maxRoundsToSync: maxBlocksToDisplay,
      waitForBlockWhenAtTip: true,
      syncBehaviour: 'sync-oldest-start-now',
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

    const timestamp = createTimestamp()

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
            accumulateGroupsFromTransaction(acc[2], transaction, round, transaction['round-time'] ?? Math.floor(Date.now() / 1000))

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
                  const isAssetCreate = bc.roles.includes(BalanceChangeRole.AssetCreator) && bc.amount > 0n
                  // This is technically not the correct handling, as the asset manager (assigned as the address in the balance change) must destroy the asset, however it's the creator who must hold the balance on destruction.
                  // Unfortunately determining the asset creator is tricky once the asset is destroyed.
                  // It's fairly common for the asset creator to be the asset manager, so simply assume that.
                  const isAssetDestroy = bc.roles.includes(BalanceChangeRole.AssetDestroyer)
                  return isAssetOptIn || isNonZeroAmount || isAssetCreate || isAssetDestroy
                })
                .map((bc) => bc.address)
                .filter(distinct((x) => x)) ?? []

            const addressesStaleDueToTransactions = flattenTransactionResult(t)
              .filter((t) => {
                const accountIsStaleDueToRekey = t['rekey-to']
                return accountIsStaleDueToAppChanges(t) || accountIsStaleDueToRekey
              })
              .map((t) => t.sender)
              .filter(distinct((x) => x))
            const staleAddresses = Array.from(new Set(addressesStaleDueToBalanceChanges.concat(addressesStaleDueToTransactions)))
            acc[4].push(...staleAddresses)

            // Accumulate stale application ids
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

      if (assetIdsToRemove.length > 0) {
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
    }

    if (staleAddresses.length > 0) {
      const currentAccountResults = get.peek(accountResultsAtom)
      const addressesToRemove = staleAddresses.filter((staleAddress) => currentAccountResults.has(staleAddress))

      if (addressesToRemove.length > 0) {
        set(accountResultsAtom, (prev) => {
          const next = new Map(prev)
          addressesToRemove.forEach((address) => {
            next.delete(address)
          })
          return next
        })
      }
    }

    if (staleApplicationIds.length > 0) {
      const currentApplicationResults = get.peek(applicationResultsAtom)
      const applicationIdsToRemove = staleApplicationIds.filter((staleApplicationId) => currentApplicationResults.has(staleApplicationId))

      if (applicationIdsToRemove.length > 0) {
        set(applicationResultsAtom, (prev) => {
          const next = new Map(prev)
          applicationIdsToRemove.forEach((applicationId) => {
            next.delete(applicationId)
          })
          return next
        })
      }
    }

    set(addStateExtractedFromBlocksAtom, blockResults, transactionResults, Array.from(groupResults.values()))

    set(latestTransactionIdsAtom, (prev) => {
      return transactionResults
        .reverse()
        .map((txn) => [txn.id, timestamp] as const) // This timestamp will always be earlier than the corresponding transaction timestamp, so it always expires before the transaction.
        .concat(prev)
        .slice(0, 50_000)
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

const accountIsStaleDueToAppChanges = (txn: TransactionResult) => {
  if (txn['tx-type'] !== algosdk.TransactionType.appl) {
    return false
  }
  const appCallTransaction = txn['application-transaction']!
  const isAppCreate = appCallTransaction['on-completion'] === ApplicationOnComplete.noop && !appCallTransaction['application-id']
  const isAppOptIn = appCallTransaction['on-completion'] === ApplicationOnComplete.optin && appCallTransaction['application-id']
  return isAppCreate || isAppOptIn
}
