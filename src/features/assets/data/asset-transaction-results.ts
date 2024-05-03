import { AssetIndex } from './types'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'
import { assetsTransactionResultsAtom } from './core'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { indexer } from '@/features/common/data'
import { transactionResultsAtom } from '@/features/transactions/data'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'

const fetchAssetTransactionResultsAtomBuilder = (assetIndex: AssetIndex) => {
  return atom(async () => {
    return await executePaginatedRequest(
      (response: TransactionSearchResults) => response.transactions,
      (nextToken) => {
        let s = indexer.searchForTransactions().assetID(assetIndex)
        if (nextToken) {
          s = s.nextToken(nextToken)
        }
        return s
      }
    )
  })
}

export const syncAssetTransactionResultEffectBuilder = (
  assetIndex: AssetIndex,
  fetchAssetTransactionResultsAtom: ReturnType<typeof fetchAssetTransactionResultsAtomBuilder>
) => {
  return atomEffect((get, set) => {
    ;(async () => {
      try {
        const transactionResults = await get(fetchAssetTransactionResultsAtom)
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
}

export const getAssetTransactionResultsAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const fetchAssetTransactionResults = fetchAssetTransactionResultsAtomBuilder(assetIndex)
  const syncEffect = syncAssetTransactionResultEffectBuilder(assetIndex, fetchAssetTransactionResults)

  return atom(async (get) => {
    const cachedTransactionResults = store.get(assetsTransactionResultsAtom).get(assetIndex) ?? []

    if (cachedTransactionResults.length) {
      return cachedTransactionResults
    }

    get(syncEffect)

    return await get(fetchAssetTransactionResults)
  })
}
