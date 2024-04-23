import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Asset } from '../models'

export const asAsset = (assetResult: AssetResult): Asset => {
  return {
    id: assetResult.index,
    name: assetResult.params.name,
    total: assetResult.params.total,
    decimals: assetResult.params.decimals,
    unitName: assetResult.params['unit-name'],
    clawback: assetResult.params.clawback,
  }
}
