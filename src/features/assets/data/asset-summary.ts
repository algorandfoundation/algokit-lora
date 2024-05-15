import { atom } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { asAssetSummary } from '../mappers/asset-summary'
import { AssetId } from './types'
import { getAssetResultAtom } from './asset-result'

export const createAssetSummaryAtom = (store: JotaiStore, assetId: AssetId) => {
  return atom(async (get) => {
    const assetResult = await get(getAssetResultAtom(store, assetId))
    return asAssetSummary(assetResult)
  })
}
