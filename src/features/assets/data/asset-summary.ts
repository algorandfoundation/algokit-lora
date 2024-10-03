import { atom, useAtomValue } from 'jotai'
import { asAssetSummary } from '../mappers/asset-summary'
import { AssetId } from './types'
import { getAssetResultAtom } from './asset-result'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'

export const assetSummaryResolver = (assetId: AssetId) => {
  return createAssetSummaryAtom(assetId)
}

export const createAssetSummaryAtom = (assetId: AssetId) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtom(assetId))
    return asAssetSummary(assetResult)
  })
}

const useAssetSummaryAtom = (assetId: AssetId) => {
  return useMemo(() => {
    return createAssetSummaryAtom(assetId)
  }, [assetId])
}

export const useLoadableAssetSummaryAtom = (assetId: AssetId) => {
  const assetSummaryAtom = useAssetSummaryAtom(assetId)
  return useAtomValue(loadable(assetSummaryAtom))
}
