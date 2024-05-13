import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { asAssetSummary } from '../mappers/asset-summary'
import { AssetIndex } from './types'
import { getAssetResultAtomBuilder } from './asset-result'

export const getAssetSummaryAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtomBuilder(store, assetIndex))
    return asAssetSummary(assetResult)
  })
}

export const getAssetSummariesAtomBuilder = (store: JotaiStore, assetIndexes: AssetIndex[]) => {
  return atom((get) => {
    return Promise.all(assetIndexes.map((assetIndex) => get(getAssetSummaryAtomBuilder(store, assetIndex))))
  })
}

export const useAssetSummaryAtom = (assetIndex: AssetIndex) => {
  const store = useStore()
  return useMemo(() => {
    return getAssetSummaryAtomBuilder(store, assetIndex)
  }, [store, assetIndex])
}

export const useLoadableAssetSummary = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetSummaryAtom(assetIndex)))
}
