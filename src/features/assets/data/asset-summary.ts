import { atom } from 'jotai'
import { asAssetSummary } from '../mappers/asset-summary'
import { AssetId } from './types'
import { getAssetResultAtom } from './asset-result'

export const assetSummaryResolver = (assetId: AssetId) => {
  return createAssetSummaryAtom(assetId)
}

export const createAssetSummaryAtom = (assetId: AssetId) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtom(assetId))
    return asAssetSummary(assetResult)
  })
}
