import { atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { AssetLookupResult, AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { indexer } from '../common/data'
import { JotaiStore } from '../common/data/types'

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const assetsAtom = atom<Map<number, AssetResult>>(new Map())

export const fetchAssetAtomBuilder = (store: JotaiStore, assetIndex: number) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const asset = await get(assetAtom)
        set(assetsAtom, (prev) => {
          return new Map([...prev, [asset.index, asset]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
  const assetAtom = atom((get) => {
    const assets = store.get(assetsAtom)
    const cachedAsset = assets.get(assetIndex)
    if (cachedAsset) {
      return cachedAsset
    }

    get(syncEffect)

    return indexer
      .lookupAssetByID(assetIndex)
      .do()
      .then((result) => {
        return (result as AssetLookupResult).asset
      })
  })
  return assetAtom
}

export const fetchAssetsAtomBuilder = (store: JotaiStore, assetIndexes: number[]) => {
  return atom(async (get) => {
    return await Promise.all(assetIndexes.map((assetIndex) => get(fetchAssetAtomBuilder(store, assetIndex))))
  })
}

export const useAssetAtom = (assetIndex: number) => {
  const store = useStore()
  return useMemo(() => {
    return fetchAssetAtomBuilder(store, assetIndex)
  }, [store, assetIndex])
}

export const useLoadableAsset = (assetId: number) => {
  return useAtomValue(loadable(useAssetAtom(assetId)))
}
