import { Atom, atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { loadable } from 'jotai/utils'
import { TransactionId } from './types'
import { asTransaction } from '../mappers/transaction-mappers'
import { assetSummaryResolver } from '@/features/assets/data'
import { InnerTransaction, Transaction, TransactionType } from '../models'
import { getTransactionResultAtom } from './transaction-result'
import { abiMethodResolver } from '@/features/abi-methods/data'

export const createInnerTransactionAtom = (
  transactionResult: TransactionResult | Atom<TransactionResult | Promise<TransactionResult>>,
  innerId: string
) => {
  return atom(async (get) => {
    const txn = 'id' in transactionResult ? transactionResult : await get(transactionResult)
    const transaction = asTransaction(txn, assetSummaryResolver, abiMethodResolver)
    if (transaction.type !== TransactionType.AppCall) {
      throw new Error('Only application call transactions have inner transactions')
    }

    const indexes = innerId.split('/').map((s) => parseInt(s))
    let current: Transaction | InnerTransaction = transaction
    for (const i of indexes) {
      if (current.type === TransactionType.AppCall) {
        current = current.innerTransactions[i - 1]
      }
    }

    return current
  })
}

const useInnerTransactionAtom = (transactionId: TransactionId, innerId: string) => {
  return useMemo(() => {
    return createInnerTransactionAtom(getTransactionResultAtom(transactionId), innerId)
  }, [transactionId, innerId])
}

export const useLoadableInnerTransactionAtom = (transactionId: TransactionId, innerId: string) => {
  return useAtomValue(loadable(useInnerTransactionAtom(transactionId, innerId)))
}
