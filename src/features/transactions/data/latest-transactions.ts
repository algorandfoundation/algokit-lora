import { useLatestBlockSummariesAtom } from '@/features/blocks/data'
import { atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'

const maxTransactionsToDisplay = 50

const latestTransactionSummariesAtomBuilder = (latestBlockSummariesAtom: ReturnType<typeof useLatestBlockSummariesAtom>) => {
  return atom((get) => {
    const latestBlockSummaries = get(latestBlockSummariesAtom)
    return latestBlockSummaries.flatMap((b) => b.transactions).splice(0, maxTransactionsToDisplay)
  })
}

const useLatestTransactionSummariesAtom = (latestBlockSummariesAtom: ReturnType<typeof useLatestBlockSummariesAtom>) => {
  return useMemo(() => {
    return latestTransactionSummariesAtomBuilder(latestBlockSummariesAtom)
  }, [latestBlockSummariesAtom])
}

export const useLatestTransactionSummaries = () => {
  const store = useStore()
  const latestBlockSummariesAtom = useLatestBlockSummariesAtom(store)

  return useAtomValue(useLatestTransactionSummariesAtom(latestBlockSummariesAtom))
}
