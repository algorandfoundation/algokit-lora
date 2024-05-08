import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { asAssetSummary } from './asset-summary'
import { AssetMetadata } from '../data/types'
import { Asset } from '../models'

export const asAsset = (assetResult: AssetResult, metadata: AssetMetadata[]): Asset => {
  return {
    ...asAssetSummary(assetResult),
    metadata, // TODO: NC - May need to think through this a bit
  }
}
