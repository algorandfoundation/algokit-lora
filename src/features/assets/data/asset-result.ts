import { atom } from 'jotai'
import { AssetIndex, AssetResult } from './types'
import { indexer, algod } from '@/features/common/data'
import { atomEffect } from 'jotai-effect'
import { assetResultsAtom } from './core'
import { JotaiStore } from '@/features/common/data/types'
import { asError, is404 } from '@/utils/error'

export const fetchAssetResultAtomBuilder = (assetIndex: AssetIndex) =>
  atom(async (_get) => {
    try {
      // Check algod first, as there can be some syncing delays to indexer
      return await algod
        .getAssetByID(assetIndex)
        .do()
        .then((result) => result as AssetResult)
    } catch (e: unknown) {
      if (is404(asError(e))) {
        // Handle destroyed assets or assets that may not be available in algod potentially due to the node type
        return await indexer
          .lookupAssetByID(assetIndex)
          .includeAll(true) // Returns destroyed assets
          .do()
          .then((result) => result.asset as AssetResult)
      }
      throw e
    }
  })

export const getAssetResultAtomBuilder = (_store: JotaiStore, assetIndex: AssetIndex) => {
  return atom(async (get) => {
    // TODO: NC - This results in double fetching when an atom depends on this, due to depending on something that we directly set using an effect.
    // I'll be coming back and re-evaluating the patterns here.
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
