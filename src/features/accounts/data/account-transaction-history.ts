import { Address } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'
import { extractTransactionsForAccount } from '../utils/extract-transaction-for-account'

const fetchAccountTransactionResults = async (address: Address, pageSize: number, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .address(address)
    .nextToken(nextPageToken ?? '')
    .limit(pageSize)
    .do()) as TransactionSearchResults
  return {
    transactionResults: results.transactions,
    nextPageToken: results['next-token'],
  } as const
}

const createSyncEffect = (transactionResults: TransactionResult[]) => {
  return atomEffect((_, set) => {
    ;(async () => {
      try {
        set(transactionResultsAtom, (prev) => {
          const next = new Map(prev)
          transactionResults.forEach((transactionResult) => {
            if (!next.has(transactionResult.id)) {
              next.set(transactionResult.id, atom(transactionResult))
            }
          })
          return next
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const creatAccountTransactionAtom = (store: JotaiStore, address: Address, pageSize: number, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await fetchAccountTransactionResults(address, pageSize, nextPageToken)

    get(createSyncEffect(transactionResults))

    const transactions = await get(createTransactionsAtom(store, transactionResults))
    const transactionsForAccount = transactions.flatMap((transaction) => extractTransactionsForAccount(transaction, address))
    return {
      rows: transactionsForAccount,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useFetchNextAccountTransactionPage = (address: Address) => {
  const store = useStore()

  return useMemo(() => {
    return (pageSize: number, nextPageToken?: string) => creatAccountTransactionAtom(store, address, pageSize, nextPageToken)
  }, [store, address])
}
