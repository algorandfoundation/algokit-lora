import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Asset } from '../models'
import { asJson } from '@/utils/as-json'

export const asAsset = (assetResult: AssetResult): Asset => {
  return {
    id: assetResult.index,
    name: assetResult.params.name,
    total: assetResult.params.total,
    decimals: assetResult.params.decimals,
    unitName: assetResult.params['unit-name'],
    defaultFrozen: assetResult.params['default-frozen'] ?? false,
    url: assetResult.params.url,
    creator: assetResult.params.creator,
    manager: assetResult.params.manager,
    reserve: assetResult.params.reserve,
    freeze: assetResult.params.freeze,
    clawback: assetResult.params.clawback,
    json: asJson(assetResult),
  }
}
