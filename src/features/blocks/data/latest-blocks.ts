import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { isDefined } from '@/utils/is-defined'
import { latestTransactionIdsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import { BlockResult, Round, SubscriberState, SubscriberStatus, SubscriberStoppedDetails, SubscriberStoppedReason } from './types'
import { assetMetadataResultsAtom } from '@/features/assets/data'
import algosdk from 'algosdk'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { distinct } from '@/utils/distinct'
import { assetResultsAtom } from '@/features/assets/data'
import { addStateExtractedFromBlocksAtom, accumulateGroupsFromTransaction } from './block-result'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { AssetId } from '@/features/assets/data/types'
import { BalanceChange, BalanceChangeRole, SubscribedTransaction } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { accountResultsAtom } from '@/features/accounts/data'
import { Address } from '@/features/accounts/data/types'
import { ApplicationId } from '@/features/applications/data/types'
import { applicationResultsAtom } from '@/features/applications/data'
import { syncedRoundAtom } from './synced-round'
import { algod } from '@/features/common/data/algo-client'
import { createTimestamp, maxBlocksToDisplay } from '@/features/common/data'
import { genesisHashAtom } from './genesis-hash'
import { asError } from '@/utils/error'
import { activeWalletAccountAtom } from '@/features/wallet/data/active-wallet'
import { TransactionResult } from '@/features/transactions/data/types'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { subscribedTransactionToTransactionResult } from '@/features/transactions/mappers/subscriber-transaction-mappers'

const notStartedSubscriberStatus = { state: SubscriberState.NotStarted } satisfies SubscriberStatus
const startedSubscriberStatus = { state: SubscriberState.Started } satisfies SubscriberStatus
const subscriberStatusAtom = atom<SubscriberStatus>(notStartedSubscriberStatus)
const startSubscriberAtom = atom(null, (_get, set) => {
  set(subscriberStatusAtom, startedSubscriberStatus)
  const subscriber = set(subscriberAtom)
  subscriber.start()
})
const stopSubscriberAtom = atom(null, async (_get, set, reason: SubscriberStoppedDetails) => {
  const subscriber = set(subscriberAtom)
  await subscriber.stop(reason.reason)
  set(subscriberStatusAtom, {
    state: SubscriberState.Stopped,
    details: reason,
    timestamp: createTimestamp(),
  } satisfies SubscriberStatus)
})

export const useSubscriber = () => {
  return [useAtomValue(subscriberStatusAtom), useSetAtom(startSubscriberAtom), useSetAtom(stopSubscriberAtom)] as const
}

const _subscriberAtom = atom<AlgorandSubscriber | null>(null)
const subscriberAtom = atom(null, (get, set) => {
  const initialisedSubscriber = get(_subscriberAtom)
  if (initialisedSubscriber) {
    return initialisedSubscriber
  }

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
        get: async () => get(syncedRoundAtom) ?? 0n,
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

    const genesisHash = await get(genesisHashAtom)
    const resultGenesisHash = result.blockMetadata[0].genesisHash
    if (!genesisHash) {
      set(genesisHashAtom, resultGenesisHash)
    } else if (genesisHash !== resultGenesisHash) {
      throw new Error('Genesis hash mismatch.')
    }

    const timestamp = createTimestamp()

    const [blockTransactionIds, transactionResults, groupResults, staleAssetIds, staleAddresses, staleApplicationIds] =
      result.subscribedTransactions.reduce(
        (acc, t) => {
          if (!t.parentTransactionId && t.confirmedRound != null) {
            const round = t.confirmedRound

            const balanceChanges = extractBalanceChanges(t)
            const transaction = subscribedTransactionToTransactionResult(t)

            // Accumulate transaction ids by round
            acc[0].set(round, (acc[0].get(round) ?? []).concat(transaction.id))

            // Accumulate transactions
            acc[1].push(transaction)

            // Accumulate group results
            accumulateGroupsFromTransaction(acc[2], transaction, round, transaction.roundTime ?? Math.floor(Date.now() / 1000))

            // Accumulate stale asset ids
            const staleAssetIds = flattenTransactionResult(t)
              .filter((t) => t.txType === algosdk.TransactionType.acfg)
              .map((t) => t.assetConfigTransaction!.assetId)
              .filter(distinct((x) => x))
              .filter(isDefined) // We ignore asset create transactions because they aren't in the atom
              .filter((x) => x !== 0n) // ALGO is never stale
            acc[3] = acc[3].concat(staleAssetIds)

            // Accumulate stale addresses
            const addressesStaleDueToBalanceChanges =
              balanceChanges
                ?.filter((bc) => {
                  const isAssetOptIn =
                    bc.amount === 0n &&
                    bc.assetId !== 0n &&
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
                const accountIsStaleDueToRekey = t.rekeyTo
                return accountIsStaleDueToAppChanges(t) || accountIsStaleDueToRekey
              })
              .map((t) => t.sender)
              .filter(distinct((x) => x))
            const staleAddresses = Array.from(new Set(addressesStaleDueToBalanceChanges.concat(addressesStaleDueToTransactions)))
            acc[4] = acc[4].concat(staleAddresses)

            // Accumulate stale application ids
            const staleApplicationIds = flattenTransactionResult(t)
              .filter((t) => t.txType === algosdk.TransactionType.appl)
              .map((t) => t.applicationTransaction?.applicationId)
              .filter(distinct((x) => x))
              .filter(isDefined) // We ignore application create transactions because they aren't in the atom
            acc[5] = acc[5].concat(staleApplicationIds)
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
        genesisHash: base64ToBytes(b.genesisHash),
        genesisId: b.genesisId,
        previousBlockHash: base64ToBytes(b.previousBlockHash ?? ''),
        ...(b.rewards
          ? {
              rewards: {
                feeSink: b.rewards.feeSink,
                rewardsCalculationRound: b.rewards.rewardsCalculationRound,
                rewardsLevel: b.rewards.rewardsLevel,
                rewardsPool: b.rewards.rewardsPool,
                rewardsRate: b.rewards.rewardsRate,
                rewardsResidue: b.rewards.rewardsResidue,
              },
            }
          : undefined),
        round: b.round,
        seed: base64ToBytes(b.seed ?? ''),
        ...(b.stateProofTracking && b.stateProofTracking.length > 0
          ? {
              stateProofTracking: b.stateProofTracking.map((tracking) => ({
                nextRound: tracking.nextRound,
                onlineTotalWeight: tracking.onlineTotalWeight,
                type: tracking.type,
                votersCommitment: tracking.votersCommitment,
              })),
            }
          : undefined),
        timestamp: b.timestamp,
        transactionsRoot: base64ToBytes(b.transactionsRoot),
        transactionsRootSha256: base64ToBytes(b.transactionsRootSha256),
        txnCounter: b.txnCounter,
        proposer: b.proposer,
        ...(b.upgradeState
          ? {
              upgradeState: {
                currentProtocol: b.upgradeState.currentProtocol,
                nextProtocol: b.upgradeState.nextProtocol,
                nextProtocolApprovals: b.upgradeState.nextProtocolApprovals ?? 0n,
                nextProtocolSwitchOn: b.upgradeState.nextProtocolSwitchOn ?? 0n,
                nextProtocolVoteBefore: b.upgradeState.nextProtocolVoteBefore ?? 0n,
              },
            }
          : undefined),
        ...(b.upgradeVote
          ? {
              upgradeVote: {
                upgradeApprove: b.upgradeVote.upgradeApprove ?? false,
                upgradeDelay: b.upgradeVote.upgradeDelay ?? 0n,
                upgradePropose: b.upgradeVote.upgradePropose,
              },
            }
          : undefined),
        ...(b.participationUpdates
          ? {
              participationUpdates: {
                absentParticipationAccounts: b.participationUpdates.absentParticipationAccounts,
                expiredParticipationAccounts: b.participationUpdates.expiredParticipationAccounts,
              },
            }
          : undefined),
        transactionIds: blockTransactionIds.get(b.round) ?? [],
      } satisfies BlockResult
    })

    if (staleAssetIds.length > 0) {
      const currentAssetResults = get(assetResultsAtom)
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
      const currentAccountResults = get(accountResultsAtom)
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

      const activeAccount = await get(activeWalletAccountAtom)
      const latestRound = result.blockMetadata[result.blockMetadata.length - 1].round
      if (activeAccount && staleAddresses.includes(activeAccount.address) && latestRound > activeAccount.validAtRound) {
        set(activeWalletAccountAtom)
      }
    }

    if (staleApplicationIds.length > 0) {
      const currentApplicationResults = get(applicationResultsAtom)
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

  subscriber.onError((e) => {
    set(subscriberStatusAtom, {
      state: SubscriberState.Stopped,
      details: { reason: SubscriberStoppedReason.Error, error: asError(e) },
      timestamp: createTimestamp(),
    } satisfies SubscriberStatus)
    // eslint-disable-next-line no-console
    console.error(e)
  })

  set(_subscriberAtom, subscriber)
  return subscriber
})

const subscribeToBlocksEffect = atomEffect((_get, set) => {
  const subscriber = set(subscriberAtom)

  set(subscriberStatusAtom, startedSubscriberStatus)
  subscriber.start()

  return async () => {
    await subscriber.stop('unmounted')
  }
})

export const useSubscribeToBlocksEffect = () => {
  useAtom(subscribeToBlocksEffect)
}

const accountIsStaleDueToAppChanges = (txn: TransactionResult) => {
  if (txn.txType !== algosdk.TransactionType.appl) {
    return false
  }
  const appCallTransaction = txn.applicationTransaction!
  const isAppCreate = appCallTransaction.onCompletion === ApplicationOnComplete.noop && !appCallTransaction.applicationId
  const isAppOptIn = appCallTransaction.onCompletion === ApplicationOnComplete.optin && appCallTransaction.applicationId
  return isAppCreate || isAppOptIn
}

const extractBalanceChanges = (txn: SubscribedTransaction): BalanceChange[] => {
  const innerTxnsBalanceChanges = (txn.innerTxns ?? []).flatMap((innerTxn) => extractBalanceChanges(innerTxn)) ?? []
  return (txn.balanceChanges ?? []).concat(innerTxnsBalanceChanges)
}
