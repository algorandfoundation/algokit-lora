import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetsAtom } from './core'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { getAssetResultAtomBuilder } from './asset-summary'
import { getAsset } from '../utils/get-asset'

const getAssetAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const asset = await get(assetAtom)

        set(assetsAtom, (prev) => {
          return new Map([...prev, [assetIndex, asset]])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  const assetAtom = atom(async (get) => {
    const cachedAsset = get(assetsAtom).get(assetIndex)

    if (cachedAsset) {
      return cachedAsset
    }

    get(syncEffect)

    const assetResult = await get(getAssetResultAtomBuilder(store, assetIndex))
    return getAsset(assetResult)
  })

  return assetAtom
}

export const useAssetAtom = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    return getAssetAtomBuilder(store, assetIndex)
  }, [assetIndex, store])
}

export const useLoadableAssetAtom = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetAtom(assetIndex)))
}
