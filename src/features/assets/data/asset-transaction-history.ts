import { AssetIndex } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { fetchTransactionsAtomBuilder, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'

const fetchAssetTransactionResults = async (assetIndex: AssetIndex, pageSize: number, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .assetID(assetIndex)
    .nextToken(nextPageToken ?? '')
    .limit(pageSize)
    .do()) as TransactionSearchResults
  return {
    transactionResults: results.transactions,
    nextPageToken: results['next-token'],
  } as const
}

const syncEffectBuilder = (transactionResults: TransactionResult[]) => {
  return atomEffect((_, set) => {
    ;(async () => {
      try {
        set(transactionResultsAtom, (prev) => {
          const newMap = new Map(prev)
          transactionResults.forEach((transactionResult) => {
            newMap.set(transactionResult.id, transactionResult)
          })
          return newMap
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const fetchAssetTransactionAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex, pageSize: number, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await fetchAssetTransactionResults(assetIndex, pageSize, nextPageToken)

    get(syncEffectBuilder(transactionResults))

    const transactions = await get(fetchTransactionsAtomBuilder(store, transactionResults))

    return {
      rows: transactions,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useFetchNextAssetTransactionPage = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    return (pageSize: number, nextPageToken?: string) => fetchAssetTransactionAtomBuilder(store, assetIndex, pageSize, nextPageToken)
  }, [store, assetIndex])
}
