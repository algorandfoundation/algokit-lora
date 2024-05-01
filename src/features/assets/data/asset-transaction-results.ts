import { JotaiStore } from '@/features/common/data/types'
import { AssetIndex } from './types'
import { atomEffect } from 'jotai-effect'
import { atom } from 'jotai'
import { assetsTransactionResultsAtom } from './core'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { indexer } from '@/features/common/data'
import { transactionResultsAtom } from '@/features/transactions/data'

const fetchAssetTransactionResults = (assetIndex: AssetIndex) =>
  executePaginatedRequest(
    (response: TransactionSearchResults) => response.transactions,
    (nextToken) => {
      let s = indexer.searchForTransactions().assetID(assetIndex)
      if (nextToken) {
        s = s.nextToken(nextToken)
      }
      return s
    }
  )

export const fetchAssetTransactionResultsAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const transactionResults = await get(assetTransactionResults)

        transactionResults.forEach((transactionResult) => {
          set(transactionResultsAtom, (prev) => {
            return new Map([...prev, [transactionResult.id, transactionResult]])
          })
        })

        set(assetsTransactionResultsAtom, (prev) => {
          return new Map([...prev, [assetIndex, transactionResults]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
  const assetTransactionResults = atom((get) => {
    const assetsTransactionResults = store.get(assetsTransactionResultsAtom)
    const cachedTransactionResults = assetsTransactionResults.get(assetIndex)
    if (cachedTransactionResults) {
      return cachedTransactionResults
    }

    get(syncEffect)

    return fetchAssetTransactionResults(assetIndex).then((result) => {
      return result
    })
  })
  return assetTransactionResults
}
