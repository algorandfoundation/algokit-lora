import { latestBlockSummariesAtom } from '@/features/blocks/data'
import { atom, useAtom, useAtomValue } from 'jotai'
import { TransactionSummary } from '../models'
import { atomEffect } from 'jotai-effect'
import { showLiveUpdatesAtom } from '@/features/common/data'

const maxTransactionsToDisplay = 8

const latestTransactionSummariesAtom = atom<TransactionSummary[]>([])

const liveTransactionsEffect = atomEffect((get, set) => {
  const showLiveUpdates = get(showLiveUpdatesAtom)
  if (!showLiveUpdates) {
    return
  }

  const latestTransactionSummaries: TransactionSummary[] = []
  exit_loops: for (const block of get(latestBlockSummariesAtom)) {
    const transactions = block.transactions.reverse()
    for (const transaction of transactions) {
      latestTransactionSummaries.push(transaction)
      if (latestTransactionSummaries.length >= maxTransactionsToDisplay) {
        break exit_loops
      }
    }
  }
  set(latestTransactionSummariesAtom, latestTransactionSummaries.slice(0, maxTransactionsToDisplay))
})

export const useLatestTransactionSummaries = () => {
  useAtom(liveTransactionsEffect)
  return useAtomValue(latestTransactionSummariesAtom)
}
