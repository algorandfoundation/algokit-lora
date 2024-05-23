import { AssetResult } from '../data/types'
import { AssetSummary } from '../models'

export const asAssetSummary = (assetResult: AssetResult): AssetSummary => {
  return {
    id: assetResult.index,
    name: assetResult.params.name,
    decimals: assetResult.params.decimals,
    unitName: assetResult.params['unit-name'],
    clawback: assetResult.params.clawback,
  }
}
