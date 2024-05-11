import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { getAssetResultAtomBuilder } from './asset-result'
import { getAssetMetadataAtomBuilder } from './asset-metadata'
import { asAsset } from '../mappers/asset'

// TODO: NC - Come back and remove store if this works
const getAssetAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const assetResultAtom = getAssetResultAtomBuilder(store, assetIndex)

  // TODO: NC - Check if we can make metadata reactive as well
  return atom(async (get) => {
    const assetResult = await get(assetResultAtom)
    console.log('hit 1', assetResult)
    return asAsset(assetResult, await get(getAssetMetadataAtomBuilder(store, assetResult)))
  })
}

export const useAssetAtom = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    console.log('ran memo')
    return getAssetAtomBuilder(store, assetIndex)
  }, [store, assetIndex])
}

export const useLoadableAsset = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetAtom(assetIndex)))
}
