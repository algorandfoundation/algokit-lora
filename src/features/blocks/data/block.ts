import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { getTransactionResultsAtom, createTransactionsAtom } from '@/features/transactions/data'
import { asBlock } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { Round } from './types'
import { syncedRoundAtom, getBlockResultAtom } from './block-result'

// TODO: NC - Can we use an effect here?
const nextRoundAvailableAtomBuilder = (store: JotaiStore, round: Round) => {
  // This atom conditionally subscribes to updates on the syncedRoundAtom
  return atom((get) => {
    const syncedRoundSnapshot = store.get(syncedRoundAtom)
    const syncedRound = syncedRoundSnapshot && round >= syncedRoundSnapshot ? get(syncedRoundAtom) : syncedRoundSnapshot
    return syncedRound ? syncedRound > round : true
  })
}

const createBlockAtom = (store: JotaiStore, round: Round) => {
  return atom(async (get) => {
    const blockResult = await get(getBlockResultAtom(store, round))
    const transactions = await get(createTransactionsAtom(store, getTransactionResultsAtom(store, blockResult.transactionIds)))
    const nextRoundAvailable = get(nextRoundAvailableAtomBuilder(store, round))
    return asBlock(blockResult, transactions, nextRoundAvailable)
  })
}

const useBlockAtom = (round: Round) => {
  const store = useStore()

  return useMemo(() => {
    return createBlockAtom(store, round)
  }, [store, round])
}

export const useLoadableBlock = (round: Round) => {
  return useAtomValue(loadable(useBlockAtom(round)))
}
