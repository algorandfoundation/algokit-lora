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

  // This atom packages up the next round number, which may not be available yet.
  // We start by initialising as a promise that never resolves (async forever atom).
  // We then activate an atomEffect, which sets the next round number based on the round that we've synced up to.
  // If we've synced the round, we know that block is available to query.
  const nextRoundWhenAvailableAtom = atom<Promise<number> | number>(new Promise<number>(() => {}))

  const setNextRoundWhenAvailableEffect = atomEffect((get, set) => {
    // Conditionally subscribe to updates on the syncedRoundAtom
    const syncedRoundSnapshot = get.peek(syncedRoundAtom)
    const syncedRound = syncedRoundSnapshot !== undefined && syncedRoundSnapshot >= nextRound ? syncedRoundSnapshot : get(syncedRoundAtom)

    if (syncedRound && syncedRound >= nextRound) {
      const nextRoundWhenAvailable = get.peek(nextRoundWhenAvailableAtom)
      if (nextRoundWhenAvailable instanceof Promise) {
        set(nextRoundWhenAvailableAtom, nextRound)
      }
    }
  })

  return atom(async (get) => {
    const blockResult = await get(getBlockResultAtom(round))
    const transactionResults = await Promise.all(getTransactionResultAtoms(blockResult.transactionIds).map((txn) => get(txn)))
    const transactions = get(createTransactionsAtom(transactionResults))
    get(setNextRoundWhenAvailableEffect)

    return asBlock(blockResult, transactions, transactionResults, nextRoundWhenAvailableAtom)
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
