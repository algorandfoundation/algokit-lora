import { atom, useAtom, useAtomValue } from 'jotai/index'
import { BlockSummary } from '@/features/blocks/models'
import { TransactionSummary } from '@/features/transactions/models'
import { atomEffect } from 'jotai-effect'
import { blockResultsAtom, syncedRoundAtom } from '@/features/blocks/data'
import { getTransactionResultAtom } from '@/features/transactions/data'
import { asTransactionSummary } from '@/features/transactions/mappers'
import { asBlockSummary } from '@/features/blocks/mappers'
import { isDefined } from '@/utils/is-defined.ts'
import { useMemo } from 'react'
import { maxBlocksToDisplay, maxTransactionsToDisplay } from '@/features/common/data'
import { useSetAtom } from 'jotai'

const liveExplorerAtomsBuilder = () => {
  const showLiveUpdatesAtom = atom<boolean>(true)
  const latestBlockSummariesAtom = atom<BlockSummary[]>([])
  const latestTransactionSummariesAtom = atom<TransactionSummary[]>([])

  const liveExplorerAtomEffect = atomEffect((get, set) => {
    const syncedRound = get(syncedRoundAtom)
    const showLiveUpdates = get(showLiveUpdatesAtom)

    if (!syncedRound || !showLiveUpdates) {
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

      const latestTransactionSummaries: TransactionSummary[] = []
      exit_loops: for (const block of latestBlockSummaries) {
        const transactions = block.transactions.reverse()
        for (const transaction of transactions) {
          latestTransactionSummaries.push(transaction)
          if (latestTransactionSummaries.length >= maxTransactionsToDisplay) {
            break exit_loops
          }
        }
      }
      set(latestTransactionSummariesAtom, latestTransactionSummaries.slice(0, maxTransactionsToDisplay))

      set(latestBlockSummariesAtom, latestBlockSummaries)
    })()
  })

  return {
    showLiveUpdatesAtom,
    liveExplorerAtomEffect,
    latestBlockSummariesAtom,
    latestTransactionSummariesAtom,
  }
}

export const useLiveExplorer = () => {
  const { showLiveUpdatesAtom, liveExplorerAtomEffect, latestTransactionSummariesAtom, latestBlockSummariesAtom } = useMemo(
    () => liveExplorerAtomsBuilder(),
    []
  )

  useAtom(liveExplorerAtomEffect)

  return {
    latestBlocks: useAtomValue(latestBlockSummariesAtom),
    latestTransactions: useAtomValue(latestTransactionSummariesAtom),
    showLiveUpdates: useAtomValue(showLiveUpdatesAtom),
    setShowLiveUpdates: useSetAtom(showLiveUpdatesAtom),
  }
}
