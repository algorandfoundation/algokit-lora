import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { AssetId } from './types'
import { loadable } from 'jotai/utils'
import { getAssetMetadataResultAtom } from './asset-metadata'
import { asAsset } from '../mappers/asset'
import { getAssetResultAtom } from './asset-result'

const createAssetAtom = (assetId: AssetId) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtom(assetId))
    const assetMetadata = await get(getAssetMetadataResultAtom(assetResult))
    return asAsset(assetResult, assetMetadata)
  })
}

export const useAssetAtom = (assetId: AssetId) => {
  return useMemo(() => {
    return createAssetAtom(assetId)
  }, [assetId])
}

export const useLoadableAsset = (assetId: AssetId) => {
  return useAtomValue(loadable(useAssetAtom(assetId)))
}
