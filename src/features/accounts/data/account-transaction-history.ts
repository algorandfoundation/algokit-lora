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
import { create } from 'domain'

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

export const useFetchAccountTransactionResults = (address: Address) => {
  return useMemo(() => {
    return (nextPageToken?: string) => createAccountTransactionResultAtom(address, nextPageToken)
  }, [address])
}

const createAccountTransactionAtom = (store: JotaiStore, address: Address, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await getAccountTransactionResults(address, nextPageToken)

    get(createSyncEffect(transactionResults))

    const transactions = await get(createTransactionsAtom(store, transactionResults))

    return {
      items: transactions,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useFetchNextAccountTransactionPage = (address: Address) => {
  const store = useStore()

  return useMemo(() => {
    return (nextPageToken?: string) => createAccountTransactionAtom(store, address, nextPageToken)
  }, [store, address])
}

export const useFoo = (address: Address) => {
  const fetchAccountTransactionResults = useFetchAccountTransactionResults(address)

  return useMemo(() => {
    return (pageSize: number) => {
      const transactionResultsAtom = atom<TransactionResult[]>([])
      const nextPageTokenAtom = atom<string | undefined>(undefined)

      const createTransactionResultPageAtom = (store: JotaiStore, pageSize: number, pageNumber: number) => {
        return atom(async (get) => {
          const index = pageNumber - 1
          const cache = store.get(transactionResultsAtom)

          const itemsFromCache = cache.slice(index * pageSize, (index + 1) * pageSize)

          if (itemsFromCache.length === pageSize) return itemsFromCache

          const { items, nextPageToken } = await get(fetchAccountTransactionResults(store.get(nextPageTokenAtom)))
          const nextCache = Array.from(cache).concat(items)
          store.set(transactionResultsAtom, nextCache)
          store.set(nextPageTokenAtom, nextPageToken)

          return nextCache.slice(index * pageSize, (index + 1) * pageSize)
        })
      }

      const createTransactionPageAtom = (store: JotaiStore, pageSize: number, pageNumber: number) => {
        return atom(async (get) => {
          const transactionResults = await get(createTransactionResultPageAtom(store, pageSize, pageNumber))
          return get(createTransactionsAtom(store, transactionResults))
        })
      }

      const usePageAtom = (pageSize: number, pageNumber: number) => {
        const store = useStore()

        return useMemo(() => {
          return createTransactionPageAtom(store, pageSize, pageNumber)
        }, [store, pageSize, pageNumber])
      }

      const useLoadablePage = (pageNumber: number) => {
        return useAtomValue(loadable(usePageAtom(pageSize, pageNumber)))
      }

      return { useLoadablePage }
    }
  }, [fetchAccountTransactionResults])
}
