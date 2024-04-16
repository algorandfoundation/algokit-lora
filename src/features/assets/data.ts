import { atom, useAtomValue, useStore } from 'jotai'
import { useMemo } from 'react'
import { AssetLookupResult, AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atomEffect } from 'jotai-effect'
import { loadable } from 'jotai/utils'
import { indexer } from '../common/data'

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
export const assetsAtom = atom<AssetResult[]>([])

export const useAssetAtom = (assetIndex: number) => {
  const store = useStore()

  return useMemo(() => {
    const syncEffect = atomEffect((get, set) => {
      ;(async () => {
        try {
          const asset = await get(assetAtom)
          set(assetsAtom, (prev) => {
            return prev.concat(asset)
          })
        } catch (e) {
          // Ignore any errors as there is nothing to sync
        }
      })()
    })
    const assetAtom = atom((get) => {
      // store.get prevents the atom from being subscribed to changes in assetsAtom
      const assets = store.get(assetsAtom)
      const asset = assets.find((a) => a.index === assetIndex)
      if (asset) {
        return asset
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
  }, [store, assetIndex])
}

export const useAssetsAtom = (assetIndexes: number[]) => {
  const store = useStore()

  return useMemo(() => {
    return assetIndexes.map((assetIndex) => {
      const syncEffect = atomEffect((get, set) => {
        ;(async () => {
          try {
            const asset = await get(assetAtom)
            set(assetsAtom, (prev) => {
              return prev.concat(asset)
            })
          } catch (e) {
            // Ignore any errors as there is nothing to sync
          }
        })()
      })
      const assetAtom = atom((get) => {
        // store.get prevents the atom from being subscribed to changes in assetsAtom
        const assets = store.get(assetsAtom)
        const asset = assets.find((a) => a.index === assetIndex)
        if (asset) {
          return asset
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
    })
  }, [store, assetIndexes])
}

export const useLoadableAsset = (assetIndex: number) => {
  return useAtomValue(
    // Unfortunately we can't leverage Suspense here, as react doesn't support async useMemo inside the Suspense component
    // https://github.com/facebook/react/issues/20877
    loadable(useAssetAtom(assetIndex))
  )
}
