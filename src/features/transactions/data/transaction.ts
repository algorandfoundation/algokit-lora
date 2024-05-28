import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { loadable } from 'jotai/utils'
import { TransactionId } from './types'
import { JotaiStore } from '@/features/common/data/types'
import { asTransaction } from '../mappers/transaction-mappers'
import { getTransactionResultAtom } from './transaction-result'
import { createAssetResolver } from '@/features/assets/data/asset-summary'

export const createTransactionsAtom = (store: JotaiStore, transactionResults: TransactionResult[]) => {
  return atom((_get) => {
    const assetResolver = createAssetResolver(store)

    return transactionResults.map((transactionResult) => {
      return asTransaction(transactionResult, assetResolver)
    })
  })
}

export const createTransactionAtom = (
  store: JotaiStore,
  transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>
) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    return asTransaction(txn, createAssetResolver(store))
  })
}

const useTransactionAtom = (transactionId: TransactionId) => {
  const store = useStore()

  return useMemo(() => {
    return createTransactionAtom(store, getTransactionResultAtom(store, transactionId))
  }, [store, transactionId])
}

export const useLoadableTransactionAtom = (transactionId: TransactionId) => {
  return useAtomValue(loadable(useTransactionAtom(transactionId)))
}
