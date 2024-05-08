import { atom } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetMetadataAtom } from './core'
import { AssetResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { indexer } from '@/features/common/data'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType } from 'algosdk'
import { asAssetMetadata } from '../mappers/asset-metadata'

export const fetchAssetMetadataAtomBuilder = (assetResult: AssetResult) =>
  atom(async (_get) => {
    // TODO: NC - We should be able to simplify this
    const results = await executePaginatedRequest(
      (response: TransactionSearchResults) => response.transactions,
      (nextToken) => {
        let s = indexer.searchForTransactions().assetID(assetResult.index).txType('acfg')
        if (nextToken) {
          s = s.nextToken(nextToken)
        }
        return s
      }
    )
    const assetConfigTransactionResults = results.flatMap(flattenTransactionResult).filter((t) => t['tx-type'] === TransactionType.acfg)
    // TODO: NC - Handle the scenario where the latest transaction is an asset destroy
    return await asAssetMetadata(assetResult, assetConfigTransactionResults[assetConfigTransactionResults.length - 1])
  })

export const getAssetMetadataAtomBuilder = (store: JotaiStore, assetResult: AssetResult) => {
  const fetchAssetMetadataAtom = fetchAssetMetadataAtomBuilder(assetResult)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetMetadata = await get(fetchAssetMetadataAtom)
        set(assetMetadataAtom, (prev) => {
          const next = new Map(prev)
          next.set(assetResult.index, assetMetadata)
          return next
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const assetMetadata = store.get(assetMetadataAtom)
    const cachedAssetMetadata = assetMetadata.get(assetResult.index)
    if (cachedAssetMetadata) {
      return cachedAssetMetadata
    }

    get(syncEffect)

    const assetMetadataResult = await get(fetchAssetMetadataAtom)
    return assetMetadataResult
  })
}
