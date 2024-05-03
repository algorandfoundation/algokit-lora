import algosdk from 'algosdk'
import { AssetIndex } from './types'
import { atomEffect } from 'jotai-effect'
import { atom } from 'jotai'
import { assetsAssetConfigTransactionResultsAtom } from './core'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { indexer } from '@/features/common/data'
import { transactionResultsAtom } from '@/features/transactions/data'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'

const fetchAssetAssetConfigTransactionResultsAtomBuilder = (assetIndex: AssetIndex) => {
  return atom(async () => {
    const results = await executePaginatedRequest(
      (response: TransactionSearchResults) => response.transactions,
      (nextToken) => {
        let s = indexer.searchForTransactions().assetID(assetIndex).txType('acfg')
        if (nextToken) {
          s = s.nextToken(nextToken)
        }
        return s
      }
    )
    return results.flatMap(flattenTransactionResult).filter((t) => t['tx-type'] === algosdk.TransactionType.acfg)
  })
}

const syncAssetAssetConfigTransactionResultEffectBuilder = (
  assetIndex: AssetIndex,
  fetchAssetTransactionResultsAtom: ReturnType<typeof fetchAssetAssetConfigTransactionResultsAtomBuilder>
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

        set(assetsAssetConfigTransactionResultsAtom, (prev) => {
          return new Map([...prev, [assetIndex, transactionResults]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

export const getAssetAssetConfigTransactionResultsAtomBuilder = (assetIndex: AssetIndex) => {
  const fetchAtom = fetchAssetAssetConfigTransactionResultsAtomBuilder(assetIndex)
  const syncEffect = syncAssetAssetConfigTransactionResultEffectBuilder(assetIndex, fetchAtom)

  return atom(async (get) => {
    const cachedTransactionResults = get(assetsAssetConfigTransactionResultsAtom).get(assetIndex) ?? []

    if (cachedTransactionResults.length) {
      return cachedTransactionResults
    }

    get(syncEffect)

    return await get(fetchAtom)
  })
}
