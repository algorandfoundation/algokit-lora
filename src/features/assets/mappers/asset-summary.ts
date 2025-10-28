import { AssetResult } from '../data/types'
import { AssetSummary } from '../models'

import { base64ToUtf8IfValid } from '@/utils/base64-to-utf8'

export const asAssetSummary = (assetResult: AssetResult): AssetSummary => {
  return {
    id: assetResult.index,
    name:
      assetResult.params.name ?? (assetResult.params.nameB64 ? base64ToUtf8IfValid(bytesToBase64(assetResult.params.nameB64)) : undefined),
    decimals: Number(assetResult.params.decimals),
    unitName: assetResult.params.unitName,
    creator: assetResult.params.creator,
    manager: assetResult.params.manager,
    reserve: assetResult.params.reserve,
    freeze: assetResult.params.freeze,
    clawback: assetResult.params.clawback,
  }
}
