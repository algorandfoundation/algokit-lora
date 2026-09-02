import { AssetId } from '../data/types'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom } from 'jotai'
import { createLoadableViewModelPageAtom } from '@/features/common/data/lazy-load-pagination'
import { DEFAULT_FETCH_SIZE } from '@/features/common/constants'
import { indexer } from '@/features/common/data/algo-client'
import { TransactionResult } from '@/features/transactions/data/types'
import { indexerTransactionToTransactionResult } from '@/features/transactions/mappers/indexer-transaction-mappers'

const getAssetTransactionResults = async (assetId: AssetId, nextPageToken?: string) => {
  const results = await indexer
    .searchForTransactions()
    .assetID(assetId)
    .nextToken(nextPageToken ?? '')
    .limit(DEFAULT_FETCH_SIZE)
    .do()
  return {
    transactionResults: results.transactions.map((txn) => indexerTransactionToTransactionResult(txn)),
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

const createAssetTransactionResultsAtom = (assetId: AssetId, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await getAssetTransactionResults(assetId, nextPageToken)

    get(createSyncEffect(transactionResults))

    return {
      items: transactionResults,
      nextPageToken: newNextPageToken,
    }
  })
}

export const createLoadableAssetTransactionsPage = (assetId: AssetId) => {
  return createLoadableViewModelPageAtom({
    fetchRawData: (nextPageToken?: string) => createAssetTransactionResultsAtom(assetId, nextPageToken),
    createViewModelPageAtom: (rawDataPage) =>
      atom((get) => {
        return {
          items: get(createTransactionsAtom(rawDataPage.items)),
          hasNextPage: rawDataPage.hasNextPage,
        }
      }),
  })
}
