import { useMemo } from 'react'
import { getTransactionResultAtom, liveTransactionIdsAtom } from '@/features/transactions/data'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { atomEffect } from 'jotai-effect'
import { Atom, atom, useAtom, useAtomValue, useStore } from 'jotai'
import { TransactionId } from '@/features/transactions/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { JotaiStore } from '@/features/common/data/types'

export const useLiveTransactions = (
  mapper: (store: JotaiStore, transactionResult: TransactionResult) => Atom<Promise<(Transaction | InnerTransaction)[]>>,
  maxRows: number
) => {
  const store = useStore()

  const { liveTransactionsAtomEffect, liveTransactionsAtom } = useMemo(() => {
    const syncedTransactionIdAtom = atom<TransactionId | undefined>(undefined)
    const liveTransactionsAtom = atom<(Transaction | InnerTransaction)[]>([])

    const liveTransactionsAtomEffect = atomEffect((get, set) => {
      ;(async () => {
        const liveTransactionIds = get(liveTransactionIdsAtom)
        const syncedTransactionId = get.peek(syncedTransactionIdAtom)

        set(syncedTransactionIdAtom, liveTransactionIds[0])
        const newTransactionResults: TransactionResult[] = []
        for (const transactionId of liveTransactionIds) {
          if (transactionId === syncedTransactionId) {
            break
          }
          const transactionResultAtom = getTransactionResultAtom(store, transactionId)

          const transactionResult = await get.peek(transactionResultAtom)
          newTransactionResults.push(transactionResult)
        }
        const newTransactions = (
          await Promise.all(newTransactionResults.map((transactionResult) => get(mapper(store, transactionResult))))
        ).flat()

        if (newTransactions.length) {
          set(liveTransactionsAtom, (prev) => {
            return newTransactions.concat(prev).slice(0, maxRows)
          })
        }
      })()
    })

    return {
      liveTransactionsAtomEffect,
      liveTransactionsAtom,
    }
  }, [store, mapper, maxRows])

  useAtom(liveTransactionsAtomEffect)

  const transactions = useAtomValue(liveTransactionsAtom)
  return transactions
}
