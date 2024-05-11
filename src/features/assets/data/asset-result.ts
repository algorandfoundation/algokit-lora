import { atom } from 'jotai'
import { AssetIndex } from './types'
import { indexer } from '@/features/common/data'
import { AssetLookupResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { assetResultsAtom } from './core'
import { JotaiStore } from '@/features/common/data/types'

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

// TODO: NC - Delete
// # Options
// # 1 store atoms
// # 2 use conditional subscribe
// # 3 select atom

// # scenarios
// initial load
// cache invalidation
// update

export const getAssetResultAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  return atom(async (get) => {
    console.log('hit 2')
    const assetResults = store.get(assetResultsAtom) // TODO: NC - This must be store.get
    const cachedAssetResult = assetResults.get(assetIndex)
    if (cachedAssetResult) {
      return cachedAssetResult
    }

    // TODO: NC - Should I change the other atoms to compose in this way?
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
