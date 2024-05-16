import { latestBlockSummariesAtom } from '@/features/blocks/data'
import { atom, useAtomValue } from 'jotai'

const maxTransactionsToDisplay = 50

const createLatestTransactionSummariesAtom = () => {
  return atom((get) => {
    const latestBlockSummaries = get(latestBlockSummariesAtom)
    return latestBlockSummaries.flatMap((b) => b.transactions).splice(0, maxTransactionsToDisplay)
  })
}

const latestTransactionSummaries = createLatestTransactionSummariesAtom()

export const useLatestTransactionSummaries = () => {
  return useAtomValue(latestTransactionSummaries)
}
