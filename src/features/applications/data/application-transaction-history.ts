import { ApplicationId } from './types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'

const getApplicationTransactionResults = async (applicationID: ApplicationId, pageSize: number, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .applicationID(applicationID)
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

const createApplicationTransactionsAtom = (store: JotaiStore, applicationID: ApplicationId, pageSize: number, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await getApplicationTransactionResults(
      applicationID,
      pageSize,
      nextPageToken
    )

    get(createSyncEffect(transactionResults))

    const transactions = await get(createTransactionsAtom(store, transactionResults))

    return {
      rows: transactions,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useFetchNextApplicationTransactionsPage = (applicationID: ApplicationId) => {
  const store = useStore()

  return useMemo(() => {
    return (pageSize: number, nextPageToken?: string) => createApplicationTransactionsAtom(store, applicationID, pageSize, nextPageToken)
  }, [store, applicationID])
}
