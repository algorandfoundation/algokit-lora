import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetModel } from '../models'

export const asAsset = (assetResult: AssetResult): AssetModel => {
  return {
    id: assetResult.index,
    name: assetResult.params.name,
    total: assetResult.params.total,
    decimals: assetResult.params.decimals,
  }
}
