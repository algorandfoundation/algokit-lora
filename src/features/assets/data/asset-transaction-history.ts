import { AssetIndex } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { fetchTransactionsAtomBuilder, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'
import { extractTransactionsForAsset } from '../utils/extract-transactions-for-asset'

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
          const next = new Map(prev)
          transactionResults.forEach((transactionResult) => {
            next.set(transactionResult.id, transactionResult)
          })
          return next
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const fetchAssetTransactionsAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex, pageSize: number, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await fetchAssetTransactionResults(assetIndex, pageSize, nextPageToken)

    get(syncEffectBuilder(transactionResults))

    const transactions = await get(fetchTransactionsAtomBuilder(store, transactionResults))
    const transactionsForAsset = transactions.flatMap((transaction) => extractTransactionsForAsset(transaction, assetIndex))

    return {
      rows: transactionsForAsset,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useFetchNextAssetTransactionsPage = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    return (pageSize: number, nextPageToken?: string) => fetchAssetTransactionsAtomBuilder(store, assetIndex, pageSize, nextPageToken)
  }, [store, assetIndex])
}
