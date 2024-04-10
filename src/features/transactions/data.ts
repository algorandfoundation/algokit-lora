import { atom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { getAlgoClient, getAlgoIndexerClient, lookupTransactionById } from '@algorandfoundation/algokit-utils'

// TODO: Move this elsewhere and make it configurable once we start using it more
const indexer = getAlgoIndexerClient({
  server: 'https://mainnet-idx.algonode.cloud/',
  port: 443,
})
const algod = getAlgoClient({
  server: 'https://mainnet-api.algonode.cloud/',
  port: 443,
})

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const transactionsAtom = atom<TransactionResult[]>([])

const useTransactionAtom = (transactionId: string) => {
  const store = useStore()

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
    const transactionAtom = atom((get) => {
      // store.get prevents the atom from being subscribed to changes in transactionsAtom
      const transactions = store.get(transactionsAtom)
      const transaction = transactions.find((t) => t.id === transactionId)
      if (transaction) {
        return transaction
      }

      get(syncEffect)

      return lookupTransactionById(transactionId, indexer).then((result) => {
        return result.transaction
      })
    })
    return transactionAtom
  }, [store, transactionId])
}

export const useLoadableTransaction = (transactionId: string) => {
  return useAtomValue(
    // Unfortunately we can't leverage Suspense here, as react doesn't support async useMemo inside the Suspense component
    // https://github.com/facebook/react/issues/20877
    loadable(useTransactionAtom(transactionId))
  )
}

export const useLogicsigTeal = (logic: string) => {
  const [tealAtom, fetchTealAtom] = useMemo(() => {
    const tealAtom = atom<Promise<string> | undefined>(undefined)
    const fetchTealAtom = atom(null, (get, set) => {
      if (get(tealAtom)) {
        return
      }

      const program = new Uint8Array(Buffer.from(logic, 'base64'))
      set(
        tealAtom,
        algod
          .disassemble(program)
          .do()
          .then((result) => result.result)
      )
    })
    return [tealAtom, fetchTealAtom] as const
  }, [logic])

  return [useAtomValue(loadable(tealAtom)), useSetAtom(fetchTealAtom)] as const
}
