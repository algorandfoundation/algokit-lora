import { atom, useAtomValue, getDefaultStore } from 'jotai'
import * as algokit from '@algorandfoundation/algokit-utils'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'

// TODO: Move this elsewhere and make it configurable once we start using it more
const indexer = algokit.getAlgoIndexerClient({
  server: 'https://testnet-idx.algonode.cloud/',
  port: 443,
})

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const transactionsAtom = atom<TransactionResult[]>([])

const useTransactionAtom = (transactionId: string) => {
  return useMemo(() => {
    const syncEffect = atomEffect((get, set) => {
      ;(async () => {
        try {
          const transaction = await get(transactionAtom)
          set(transactionsAtom, (prev) => {
            return prev.concat(transaction)
          })
        } catch (e) {
          // Ignore any errors as there is nothing to sync
        }
      })()
    })
    const store = getDefaultStore()
    const transactionAtom = atom((get) => {
      // store.get prevents the atom from being subscribed to changes in transactionsAtom
      const transactions = store.get(transactionsAtom)
      const transaction = transactions.find((t) => t.id === transactionId)
      if (transaction) {
        return transaction
      }

      get(syncEffect)

      return algokit.lookupTransactionById(transactionId, indexer).then((result) => {
        return result.transaction
      })
    })
    return transactionAtom
  }, [transactionId])
}

export const useLoadableTransaction = (transactionId: string) => {
  return useAtomValue(
    // Unfortunately we can't leverage Suspense here, as react doesn't support async useMemo inside the Suspense component
    // https://github.com/facebook/react/issues/20877
    loadable(useTransactionAtom(transactionId))
  )
}
