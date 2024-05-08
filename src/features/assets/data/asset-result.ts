import { atom } from 'jotai'
import { AssetIndex } from './types'
import { indexer } from '@/features/common/data'
import { AssetLookupResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { assetResultsAtom } from './core'

// TODO: NC - Get asset from algod instead of indexer
export const fetchAssetResultAtomBuilder = (assetIndex: AssetIndex) =>
  atom(async (_get) => {
    return await indexer
      .lookupAssetByID(assetIndex)
      .includeAll(true)
      .do()
      .then((result) => {
        return (result as AssetLookupResult).asset
      })
  })

export const getAssetResultAtomBuilder = (assetIndex: AssetIndex) => {
  return atom(async (get) => {
    const assetResults = get(assetResultsAtom)
    const cachedAssetResult = assetResults.get(assetIndex)
    if (cachedAssetResult) {
      return cachedAssetResult
    }

    const fetchAssetResultAtom = fetchAssetResultAtomBuilder(assetIndex)
    const syncEffect = atomEffect((get, set) => {
      ;(async () => {
        try {
          const assetResult = await get(fetchAssetResultAtom)
          set(assetResultsAtom, (prev) => {
            const next = new Map(prev)
            next.set(assetResult.index, assetResult)
            return next
          })
        } catch (e) {
          // Ignore any errors as there is nothing to sync
        }
      })()
    })
    get(syncEffect)

    return await get(fetchAssetResultAtom)
  })
}
