import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { getAssetResultAtomBuilder } from './asset-result'
import { getAssetMetadataAtomBuilder } from './asset-metadata'
import { asAsset } from '../mappers/asset'

const getAssetAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const assetResultAtom = getAssetResultAtomBuilder(store, assetIndex)

  return atom(async (get) => {
    const assetResult = await get(assetResultAtom)
    return asAsset(assetResult, await get(getAssetMetadataAtomBuilder(store, assetResult)))
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
