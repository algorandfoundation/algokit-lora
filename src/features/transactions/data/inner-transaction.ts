import { Atom, atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { loadable } from 'jotai/utils'
import { TransactionId } from './types'
import { JotaiStore } from '@/features/common/data/types'
import { asTransaction } from '../mappers/transaction-mappers'
import { createAssetResolver } from '@/features/assets/data'
import { InnerTransaction, Transaction, TransactionType } from '../models'
import { getTransactionResultAtom } from './transaction-result'

export const createInnerTransactionAtom = (
  store: JotaiStore,
  transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>,
  innerId: string
) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    const transaction = asTransaction(txn, createAssetResolver(store))
    if (transaction.type !== TransactionType.ApplicationCall) {
      throw new Error('Only application call transactions have inner transactions')
    }

    const indexes = innerId.split('-').map((s) => parseInt(s))
    let current: Transaction | InnerTransaction = transaction
    for (const i of indexes) {
      if (current.type === TransactionType.ApplicationCall) {
        current = current.innerTransactions[i - 1]
      }
    }

    return current
  })
}

const useInnerTransactionAtom = (transactionId: TransactionId, innerId: string) => {
  const store = useStore()

  return useMemo(() => {
    return createInnerTransactionAtom(store, getTransactionResultAtom(store, transactionId), innerId)
  }, [store, transactionId, innerId])
}

export const useLoadableInnerTransactionAtom = (transactionId: TransactionId, innerId: string) => {
  return useAtomValue(loadable(useInnerTransactionAtom(transactionId, innerId)))
}
