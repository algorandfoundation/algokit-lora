import { latestBlockSummariesAtom } from '@/features/blocks/data'
import { atom, useAtomValue } from 'jotai'
import { TransactionSummary } from '../models'

const maxTransactionsToDisplay = 10

const createLatestTransactionSummariesAtom = () => {
  return atom((get) => {
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
    return latestTransactionSummaries.slice(0, maxTransactionsToDisplay)
  })
}

const latestTransactionSummaries = createLatestTransactionSummariesAtom()

export const useLatestTransactionSummaries = () => {
  return useAtomValue(latestTransactionSummaries)
}
