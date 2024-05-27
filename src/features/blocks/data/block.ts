import { atom, useAtomValue } from 'jotai'
import { getTransactionResultAtoms, createTransactionsAtom } from '@/features/transactions/data'
import { asBlock } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { Round } from './types'
import { getBlockResultAtom } from './block-result'
import { syncedRoundAtom } from './synced-round'
import { atomEffect } from 'jotai-effect'

const createBlockAtom = (round: Round) => {
  const nextRound = round + 1
  const syncNextRoundWhenAvailableEffect = atomEffect((get, set) => {
    // Conditionally subscribes to updates on the syncedRoundAtom
    const syncedRoundSnapshot = get.peek(syncedRoundAtom)
    const syncedRound = syncedRoundSnapshot !== undefined && syncedRoundSnapshot >= nextRound ? syncedRoundSnapshot : get(syncedRoundAtom)

    if (syncedRound && syncedRound >= nextRound) {
      const nextRoundWhenAvailable = get.peek(nextRoundWhenAvailableAtom)
      if (nextRoundWhenAvailable instanceof Promise) {
        set(nextRoundWhenAvailableAtom, nextRound)
      }
    }
  })
  // create initial state as async forever
  const nextRoundWhenAvailableAtom = atom<Promise<number> | number>(new Promise<number>(() => {}))

  return atom(async (get) => {
    const blockResult = await get(getBlockResultAtom(round))
    const transactionResults = await Promise.all(getTransactionResultAtoms(blockResult.transactionIds).map((txn) => get(txn)))
    const transactions = get(createTransactionsAtom(transactionResults))
    get(syncNextRoundWhenAvailableEffect)

    return asBlock(blockResult, transactions, nextRoundWhenAvailableAtom)
  })
}

const useBlockAtom = (round: Round) => {
  return useMemo(() => {
    return createBlockAtom(round)
  }, [round])
}

export const useLoadableBlock = (round: Round) => {
  return useAtomValue(loadable(useBlockAtom(round)))
}
