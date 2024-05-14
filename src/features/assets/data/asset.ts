import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { useMemo } from 'react'
import { AssetId } from './types'
import { loadable } from 'jotai/utils'
import { getAssetMetadataResultAtom } from './asset-metadata'
import { asAsset } from '../mappers/asset'
import { getAssetResultAtom } from './asset-result'

const createAssetAtom = (store: JotaiStore, assetId: AssetId) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtom(store, assetId))
    return asAsset(assetResult, await get(getAssetMetadataResultAtom(store, assetResult)))
  })
}

export const useAssetAtom = (assetId: AssetId) => {
  const store = useStore()

  return useMemo(() => {
    return createAssetAtom(store, assetId)
  }, [store, assetId])
}

export const useLoadableAsset = (assetId: AssetId) => {
  return useAtomValue(loadable(useAssetAtom(assetId)))
}
