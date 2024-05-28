import { useMemo } from 'react'
import { createTransactionAtom, getTransactionResultAtom, liveTransactionIdsAtom } from '@/features/transactions/data'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { atomEffect } from 'jotai-effect'
import { atom, useAtom, useAtomValue } from 'jotai'
import { TransactionId } from '@/features/transactions/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export const useLiveTransactions = (filter: (transactionResult: TransactionResult) => boolean, maxRows: number) => {
  const { liveTransactionsAtomEffect, liveTransactionsAtom } = useMemo(() => {
    let syncedTransactionId: TransactionId | undefined = undefined
    const liveTransactionsAtom = atom<(Transaction | InnerTransaction)[]>([])

    const liveTransactionsAtomEffect = atomEffect((get, set) => {
      ;(async () => {
        const liveTransactionIds = get(liveTransactionIdsAtom)

        const newTransactionResults: TransactionResult[] = []
        for (const transactionId of liveTransactionIds) {
          if (transactionId === syncedTransactionId) {
            break
          }
          const transactionResultAtom = getTransactionResultAtom(transactionId)

          const transactionResult = await get.peek(transactionResultAtom)
          newTransactionResults.push(transactionResult)
        }
        syncedTransactionId = liveTransactionIds[0]

        const newTransactions = await Promise.all(
          newTransactionResults.filter(filter).map(async (transactionResult) => await get(createTransactionAtom(transactionResult)))
        )
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
  }, [filter, maxRows])

  useAtom(liveTransactionsAtomEffect)

  const transactions = useAtomValue(liveTransactionsAtom)
  return transactions
}
