import { Address } from '../data/types'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom } from 'jotai'
import { createLoadableViewModelPageAtom } from '@/features/common/data/lazy-load-pagination'
import { DEFAULT_FETCH_SIZE } from '@/features/common/constants'
import { indexer } from '@/features/common/data/algo-client'

const getAccountTransactionResults = async (address: Address, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .address(address)
    .nextToken(nextPageToken ?? '')
    .limit(DEFAULT_FETCH_SIZE)
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
              next.set(transactionResult.id, createReadOnlyAtomAndTimestamp(transactionResult))
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

const createAccountTransactionResultsAtom = (address: Address, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await getAccountTransactionResults(address, nextPageToken)

    get(createSyncEffect(transactionResults))

    return {
      items: transactionResults,
      nextPageToken: newNextPageToken,
    }
  })
}

export const createLoadableAccountTransactionsPage = (address: Address) => {
  return createLoadableViewModelPageAtom({
    fetchRawData: (nextPageToken?: string) => createAccountTransactionResultsAtom(address, nextPageToken),
    createViewModelPageAtom: (rawDataPage) =>
      atom((get) => {
        return {
          items: get(createTransactionsAtom(rawDataPage.items)),
          hasNextPage: rawDataPage.hasNextPage,
        }
      }),
  })
}
