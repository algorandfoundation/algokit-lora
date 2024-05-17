import { ApplicationId } from './types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'
import { extractTransactionsForApplication } from '../utils/extract-transactions-for-application'

const fetchApplicationTransactionResults = async (applicationID: ApplicationId, pageSize: number, nextPageToken?: string) => {
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
    const { transactionResults, nextPageToken: newNextPageToken } = await fetchApplicationTransactionResults(
      applicationID,
      pageSize,
      nextPageToken
    )

    get(createSyncEffect(transactionResults))

    const transactions = await get(createTransactionsAtom(store, transactionResults))
    const transactionsForApplication = transactions.flatMap((transaction) => {
      // Sometimes, the app call transaction can be nested inside another transaction
      // In that case, we want to flag it as an inner transaction
      // We also only want to return one item per transaction even though there could be multiple
      //   because we don't want to break the pagination
      const txns = extractTransactionsForApplication(transaction, applicationID)
      if (txns.length === 0) {
        // Since this is the historical data, this should not happen
        throw new Error(`Transaction ${transaction.id} doesn't contain any inner transaction for ${applicationID}`)
      }
      return txns[0]
    })

    return {
      rows: transactionsForApplication,
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
