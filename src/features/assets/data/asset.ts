import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { AssetId } from './types'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { getAssetMetadataResultAtom } from './asset-metadata'
import { asAsset } from '../mappers/asset'
import { assetResultsAtom, getAssetResultAtom } from './asset-result'
import { atomEffect } from 'jotai-effect'

const createAssetAtoms = (assetId: AssetId) => {
  const isStaleAtom = atom(false)
  const detectIsStaleEffect = atomEffect((get, set) => {
    const assetResults = get(assetResultsAtom)
    const isStale = assetResults.get(assetId) === undefined
    set(isStaleAtom, isStale)
  })

  return [
    atomWithRefresh(async (get) => {
      const assetResult = await get(getAssetResultAtom(assetId))
      const assetMetadata = await get(getAssetMetadataResultAtom(assetResult))
      get(detectIsStaleEffect)
      return asAsset(assetResult, assetMetadata)
    }),
    isStaleAtom,
  ] as const
}

export const useAssetAtoms = (assetId: AssetId) => {
  return useMemo(() => {
    return createAssetAtoms(assetId)
  }, [assetId])
}

export const useLoadableAsset = (assetId: AssetId) => {
  const [assetAtom, isStaleAtom] = useAssetAtoms(assetId)
  return [useAtomValue(loadable(assetAtom)), useSetAtom(assetAtom), useAtomValue(isStaleAtom)] as const
}
