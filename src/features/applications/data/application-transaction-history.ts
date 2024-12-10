import { ApplicationId } from './types'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom } from 'jotai'
import { createLoadableViewModelPageAtom } from '@/features/common/data/lazy-load-pagination'
import { DEFAULT_FETCH_SIZE } from '@/features/common/constants'
import { indexer } from '@/features/common/data/algo-client'
import algosdk from 'algosdk'
import { TransactionResult } from '@/features/transactions/data/types'

const getApplicationTransactionResults = async (applicationID: ApplicationId, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .applicationID(applicationID)
    .nextToken(nextPageToken ?? '')
    .limit(DEFAULT_FETCH_SIZE)
    .do()) as algosdk.indexerModels.TransactionsResponse
  return {
    transactionResults: results.transactions,
    nextPageToken: results.nextToken,
  } as const
}

const createSyncEffect = (transactionResults: TransactionResult[]) => {
  return atomEffect((_, set) => {
    ;(async () => {
      try {
        set(transactionResultsAtom, (prev) => {
          const next = new Map(prev)
          transactionResults.forEach((transactionResult) => {
            if (!next.has(transactionResult.id!)) {
              next.set(transactionResult.id!, createReadOnlyAtomAndTimestamp(transactionResult))
            }
          })
          return next
        })
      } catch {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const createApplicationTransactionResultsAtom = (applicationID: ApplicationId, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await getApplicationTransactionResults(applicationID, nextPageToken)

    get(createSyncEffect(transactionResults))

    return {
      items: transactionResults,
      nextPageToken: newNextPageToken,
    }
  })
}

export const createLoadableApplicationTransactionsPage = (applicationID: ApplicationId) => {
  return createLoadableViewModelPageAtom({
    fetchRawData: (nextPageToken?: string) => createApplicationTransactionResultsAtom(applicationID, nextPageToken),
    createViewModelPageAtom: (rawDataPage) =>
      atom((get) => {
        return {
          items: get(createTransactionsAtom(rawDataPage.items)),
          hasNextPage: rawDataPage.hasNextPage,
        }
      }),
  })
}
