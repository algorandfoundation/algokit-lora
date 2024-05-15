import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { asAssetSummary } from '../mappers/asset-summary'
import { AssetId } from './types'
import { getAssetResultAtom } from './asset-result'

export const createAssetSummaryAtom = (store: JotaiStore, assetId: AssetId) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtom(store, assetId))
    return asAssetSummary(assetResult)
  })
}

// TODO: NC - Change this to createAssetSummaryAtoms (separate PR)
export const createAssetSummariesAtom = (store: JotaiStore, assetId: AssetId[]) => {
  return atom((get) => {
    return Promise.all(assetId.map((assetId) => get(createAssetSummaryAtom(store, assetId))))
  })
}

export const useAssetSummaryAtom = (assetId: AssetId) => {
  const store = useStore()
  return useMemo(() => {
    return createAssetSummaryAtom(store, assetId)
  }, [store, assetId])
}

export const useLoadableAssetSummary = (assetId: AssetId) => {
  return useAtomValue(loadable(useAssetSummaryAtom(assetId)))
}
