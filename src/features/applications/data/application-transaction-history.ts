import { ApplicationId } from './types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useAtomValue, useStore } from 'jotai'
import { createLazyLoadPageAtom } from '@/features/common/data/lazy-load-pagination'
import { loadable } from 'jotai/utils'

const getApplicationTransactionResults = async (applicationID: ApplicationId, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .applicationID(applicationID)
    .nextToken(nextPageToken ?? '')
    .limit(100)
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

export const createLoadableApplicationTransactionPage = (applicationID: ApplicationId) => {
  const fetchTransactionResults = (nextPageToken?: string) => createApplicationTransactionResultsAtom(applicationID, nextPageToken)

  return (pageSize: number) => {
    const lazyLoadPageAtom = createLazyLoadPageAtom({ pageSize, fetchData: fetchTransactionResults })

    const createPageAtom = (store: JotaiStore, pageNumber: number) => {
      return atom(async (get) => {
        const transactionResults = await get(lazyLoadPageAtom(store, pageNumber))
        return get(createTransactionsAtom(store, transactionResults))
      })
    }

    const usePageAtom = (pageNumber: number) => {
      const store = useStore()

      return useMemo(() => {
        return createPageAtom(store, pageNumber)
      }, [store, pageNumber])
    }

    const useLoadablePage = (pageNumber: number) => {
      return useAtomValue(loadable(usePageAtom(pageNumber)))
    }

    return { useLoadablePage }
  }
}
