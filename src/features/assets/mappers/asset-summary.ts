import { AssetResult } from '../data/types'
import { AssetSummary } from '../models'

export const asAssetSummary = (assetResult: AssetResult): AssetSummary => {
  return {
    id: assetResult.index,
    name: assetResult.params.name ?? assetResult.params.nameB64?.toString(),
    decimals: Number(assetResult.params.decimals),
    unitName: assetResult.params.unitName,
    creator: assetResult.params.creator,
    manager: assetResult.params.manager,
    reserve: assetResult.params.reserve,
    freeze: assetResult.params.freeze,
    clawback: assetResult.params.clawback,
  }
}
