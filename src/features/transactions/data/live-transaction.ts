import { useMemo } from 'react'
import { createTransactionAtom, getTransactionResultAtom } from '@/features/transactions/data'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { atomEffect } from 'jotai-effect'
import { atom, useAtom, useAtomValue } from 'jotai'
import { TransactionId } from '@/features/transactions/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { latestTransactionIdsAtom } from './latest-transaction-ids'

export const useLiveTransactions = (filter: (transactionResult: TransactionResult) => boolean, maxRows: number) => {
  const { liveTransactionsAtomEffect, liveTransactionsAtom } = useMemo(() => {
    let syncedTransactionId: TransactionId | undefined = undefined
    const liveTransactionsAtom = atom<(Transaction | InnerTransaction)[]>([])

    const liveTransactionsAtomEffect = atomEffect((get, set) => {
      ;(async () => {
        const latestTransactionIds = get(latestTransactionIdsAtom)

        const newTransactions: Transaction[] = []
        for (const transactionId of latestTransactionIds) {
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

        syncedTransactionId = latestTransactionIds[0]

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
    }
  }, [filter, maxRows])

  useAtom(liveTransactionsAtomEffect)

  const transactions = useAtomValue(liveTransactionsAtom)
  return transactions
}
