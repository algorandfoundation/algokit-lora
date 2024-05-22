import { AssetId } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { createTransactionsAtom, transactionResultsAtom } from '@/features/transactions/data'
import { atomEffect } from 'jotai-effect'
import { atom } from 'jotai'
import { createLoadableViewModelPageAtom } from '@/features/common/data/lazy-load-pagination'

const getAssetTransactionResults = async (assetId: AssetId, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .assetID(assetId)
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
    createViewModelPageAtom: (store, transactionResults) =>
      atom(async (get) => {
        return get(createTransactionsAtom(store, transactionResults))
      }),
  })
}
