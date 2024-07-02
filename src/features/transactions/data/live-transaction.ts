import { useMemo } from 'react'
import { createTransactionAtom, getTransactionResultAtom, latestTransactionIdsAtom } from '@/features/transactions/data'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { atomEffect } from 'jotai-effect'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { TransactionId } from '@/features/transactions/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export const useLiveTransactions = (filter: (transactionResult: TransactionResult) => boolean, maxRows: number) => {
  const { liveTransactionsAtomEffect, liveTransactionsAtom, showLiveUpdatesAtom } = useMemo(() => {
    let syncedTransactionId: TransactionId | undefined = undefined
    const liveTransactionsAtom = atom<(Transaction | InnerTransaction)[]>([])
    const showLiveUpdatesAtom = atom<boolean>(true)

    const liveTransactionsAtomEffect = atomEffect((get, set) => {
      const latestTransactionIds = get(latestTransactionIdsAtom)
      if (!get(showLiveUpdatesAtom)) {
        return
      }

      ;(async () => {
        const newTransactions: Transaction[] = []
        for (const [transactionId] of latestTransactionIds) {
          if (transactionId === syncedTransactionId) {
            break
          }

          const transactionResultAtom = getTransactionResultAtom(transactionId, { skipTimestampUpdate: true })
          const transactionResult = await get.peek(transactionResultAtom)
          if (filter(transactionResult)) {
            newTransactions.push(await get(createTransactionAtom(transactionResult)))
          }

          if (newTransactions.length >= maxRows) {
            break
          }
        }

        const [latestTransactionId] = latestTransactionIds.length > 0 ? latestTransactionIds[0] : ([undefined] as const)
        syncedTransactionId = latestTransactionId

        if (newTransactions.length > 0) {
          set(liveTransactionsAtom, (prev) => {
            return newTransactions.concat(prev).slice(0, maxRows)
          })
        }
      })()
    })

    return {
      liveTransactionsAtomEffect,
      liveTransactionsAtom,
      showLiveUpdatesAtom,
    }
  }, [filter, maxRows])

  useAtom(liveTransactionsAtomEffect)

  return {
    transactions: useAtomValue(liveTransactionsAtom),
    showLiveUpdates: useAtomValue(showLiveUpdatesAtom),
    setShowLiveUpdates: useSetAtom(showLiveUpdatesAtom),
  }
}
