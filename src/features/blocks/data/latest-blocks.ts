import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { blocksAtom, syncedRoundAtom } from '.'
import { isDefined } from '@/utils/is-defined'
import { asBlockSummary } from '../mappers'
import { transactionsAtom } from '@/features/transactions/data'
import { asTransactionSummary } from '@/features/transactions/mappers/transaction-mappers'

const maxBlocksToDisplay = 5

const latestBlockSummariesAtomBuilder = (store: JotaiStore) => {
  return atom((get) => {
    const syncedRound = get(syncedRoundAtom)
    if (!syncedRound) {
      return []
    }
    const blocks = store.get(blocksAtom)
    const transactions = store.get(transactionsAtom)

    return Array.from({ length: maxBlocksToDisplay }, (_, i) => {
      const round = syncedRound - i
      const block = blocks.get(round)

      if (block) {
        const transactionSummaries = block.transactionIds.map((transactionId) => {
          return asTransactionSummary(transactions.get(transactionId)!)
        })

        return asBlockSummary(block, transactionSummaries)
      }
    }).filter(isDefined)
  })
}

export const useLatestBlockSummariesAtom = (store: JotaiStore) => {
  return useMemo(() => {
    return latestBlockSummariesAtomBuilder(store)
  }, [store])
}

export const useLatestBlockSummaries = () => {
  const store = useStore()
  return useAtomValue(useLatestBlockSummariesAtom(store))
}
