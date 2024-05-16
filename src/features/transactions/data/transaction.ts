import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { loadable } from 'jotai/utils'
import { TransactionId } from './types'
import { JotaiStore } from '@/features/common/data/types'
import { asTransaction } from '../mappers/transaction-mappers'
import { createAssetSummaryAtom } from '@/features/assets/data'
import { getTransactionResultAtom } from './transaction-result'

export const createTransactionsAtom = (
  store: JotaiStore,
  transactionResults: TransactionResult[] | Atom<Promise<TransactionResult> | TransactionResult>[]
) => {
  return atom(async (get) => {
    const txns = await Promise.all(
      transactionResults.map(async (transactionResult) => {
        return 'id' in transactionResult ? transactionResult : await get(transactionResult)
      })
    )

    return await Promise.all(
      txns.map((transactionResult) => {
        return asTransaction(transactionResult, (assetId: number) => get(createAssetSummaryAtom(store, assetId)))
      })
    )
  })
}

export const createTransactionAtom = (
  store: JotaiStore,
  transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>
) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    return await asTransaction(txn, (assetId: number) => get(createAssetSummaryAtom(store, assetId)))
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
