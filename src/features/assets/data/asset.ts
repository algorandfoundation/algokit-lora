import { indexer } from '@/features/common/data'
import { AssetLookupResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetsAtom } from './core'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { asAsset } from '../mappers'
import { AssetIndex } from './types'

const fetchAssetResultAtomBuilder = (assetIndex: AssetIndex) =>
  atom(async (_get) => {
    return await indexer
      .lookupAssetByID(assetIndex)
      .includeAll(true)
      .do()
      .then((result) => {
        return (result as AssetLookupResult).asset
      })
  })

export const getAssetAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const fetchAssetResultAtom = fetchAssetResultAtomBuilder(assetIndex)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetResult = await get(fetchAssetResultAtom)
        set(assetsAtom, (prev) => {
          return prev.set(assetResult.index, assetResult)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const assets = store.get(assetsAtom)
    const cachedAsset = assets.get(assetIndex)
    if (cachedAsset) {
      return asAsset(cachedAsset)
    }

    get(syncEffect)

    const fetchedAsset = await get(fetchAssetResultAtom)
    return asAsset(fetchedAsset)
  })
}

export const getAssetsAtomBuilder = (store: JotaiStore, assetIndexes: AssetIndex[]) => {
  return atom((get) => {
    return Promise.all(assetIndexes.map((assetIndex) => get(getAssetAtomBuilder(store, assetIndex))))
  })
}

export const useAssetAtom = (assetIndex: AssetIndex) => {
  const store = useStore()
  return useMemo(() => {
    return getAssetAtomBuilder(store, assetIndex)
  }, [store, assetIndex])
}

export const useLoadableAsset = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetAtom(assetIndex)))
}
