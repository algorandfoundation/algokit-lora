import { Address } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useAtomValue, useStore } from 'jotai'
import { createLoadablePagination } from '@/features/common/data/loadable-pagination'
import { loadable } from 'jotai/utils'

const getAccountTransactionResults = async (address: Address, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .address(address)
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

const createAccountTransactionResultAtom = (address: Address, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await getAccountTransactionResults(address, nextPageToken)

    get(createSyncEffect(transactionResults))

    return {
      items: transactionResults,
      nextPageToken: newNextPageToken,
    }
  })
}

export const createFoo = (address: Address) => {
  const fetchAccountTransactionResults = (nextPageToken?: string) => createAccountTransactionResultAtom(address, nextPageToken)

  return (pageSize: number) => {
    const foo = createLoadablePagination({ pageSize, fetchData: fetchAccountTransactionResults })

    const createTransactionPageAtom = (store: JotaiStore, pageNumber: number) => {
      return atom(async (get) => {
        const transactionResults = await get(foo(store, pageNumber))
        return get(createTransactionsAtom(store, transactionResults))
      })
    }

    const usePageAtom = (pageNumber: number) => {
      const store = useStore()

      return useMemo(() => {
        return createTransactionPageAtom(store, pageNumber)
      }, [store, pageNumber])
    }

    const useLoadablePage = (pageNumber: number) => {
      return useAtomValue(loadable(usePageAtom(pageNumber)))
    }

    return { useLoadablePage }
  }
}
