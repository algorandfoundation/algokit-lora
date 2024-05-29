import { Atom, atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { loadable } from 'jotai/utils'
import { TransactionId } from './types'
import { asTransaction } from '../mappers/transaction-mappers'
import { getTransactionResultAtom } from './transaction-result'
import { assetSummaryResolver } from '@/features/assets/data/asset-summary'

export const createTransactionsAtom = (transactionResults: TransactionResult[]) => {
  return atom((_get) => {
    return transactionResults.map((transactionResult) => {
      return asTransaction(transactionResult, assetSummaryResolver)
    })
  })
}

export const createTransactionAtom = (transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    return asTransaction(txn, assetSummaryResolver)
  })
}

const useTransactionAtom = (transactionId: TransactionId) => {
  return useMemo(() => {
    return createTransactionAtom(getTransactionResultAtom(transactionId))
  }, [transactionId])
}

export const useLoadableTransactionAtom = (transactionId: TransactionId) => {
  return useAtomValue(loadable(useTransactionAtom(transactionId)))
}
