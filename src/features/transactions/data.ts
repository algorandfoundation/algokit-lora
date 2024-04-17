import { atom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { lookupTransactionById } from '@algorandfoundation/algokit-utils'
import { algod, indexer } from '../common/data'
import { asAppCallTransaction, asAssetTransferTransaction, asPaymentTransaction } from './mappers/transaction-mappers'
import { useAssetAtom, useAssetsAtom } from '../assets/data'
import { invariant } from '@/utils/invariant'
import { getRecursiveDataForAppCallTransaction } from './utils/get-recursive-data-for-app-call-transaction'

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
// The string key is the transaction id
export const transactionsAtom = atom<Map<string, TransactionResult>>(new Map())

// TODO: NC - This will likely be removed as part of the block refactor
export const useTransactions = (filterIds?: string[]) => {
  const transactions = useAtomValue(transactionsAtom)
  return useMemo(() => {
    const filteredTransactions = filterIds
      ? filterIds.reduce((acc, id) => {
          if (transactions.has(id)) {
            return acc.concat(transactions.get(id)!)
          }
          return acc
        }, [] as TransactionResult[])
      : Array.from(transactions.values())
    return filteredTransactions
  }, [filterIds, transactions])
}

const useTransactionAtom = (transactionId: string) => {
  const store = useStore()

  return useMemo(() => {
    const syncEffect = atomEffect((get, set) => {
      ;(async () => {
        try {
          const transaction = await get(transactionAtom)
          set(transactionsAtom, (prev) => {
            return new Map([...prev, [transaction.id, transaction]])
          })
        } catch (e) {
          // Ignore any errors as there is nothing to sync
        }
      })()
    })
    const transactionAtom = atom((get) => {
      // store.get prevents the atom from being subscribed to changes in transactionsAtom
      const transactions = store.get(transactionsAtom)
      const transaction = transactions.has(transactionId) ? transactions.get(transactionId) : undefined
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
          .then((result) => result.result as string)
      )
    })
    return [tealAtom, fetchTealAtom] as const
  }, [logic])

  return [useAtomValue(loadable(tealAtom)), useSetAtom(fetchTealAtom)] as const
}

export const useLoadableAssetTransferTransaction = (transaction: TransactionResult) => {
  invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')
  const assetId = transaction['asset-transfer-transaction']['asset-id']
  const assetAtom = useAssetAtom(assetId)

  const modelAtom = useMemo(() => {
    const assetTransferTransactionAtom = atom(async (get) => {
      return asAssetTransferTransaction(transaction, await get(assetAtom))
    })
    return assetTransferTransactionAtom
  }, [transaction, assetAtom])

  return useAtomValue(
    // Unfortunately we can't leverage Suspense here, as react doesn't support async useMemo inside the Suspense component
    // https://github.com/facebook/react/issues/20877
    loadable(modelAtom)
  )
}

export const usePaymentTransaction = (transaction: TransactionResult) => {
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

  const modelAtom = useMemo(() => {
    const transactionAtom = atom(() => {
      return asPaymentTransaction(transaction)
    })
    return transactionAtom
  }, [transaction])

  return useAtomValue(modelAtom)
}

export const useLoadableAppCallTransction = (transaction: TransactionResult) => {
  invariant(transaction['application-transaction'], 'application-transaction is not set')

  const assetIds: number[] = [] //getRecursiveDataForAppCallTransaction(transaction, 'foreign-assets')
  const assetsAtom = useAssetsAtom(assetIds)

  const modelAtom = useMemo(() => {
    const transactionAtom = atom(async (get) => {
      const assets = await Promise.all(assetsAtom.map((a) => get(a)))
      return asAppCallTransaction(transaction, assets)
    })
    return transactionAtom
  }, [assetsAtom, transaction])

  return useAtomValue(loadable(modelAtom))
}
