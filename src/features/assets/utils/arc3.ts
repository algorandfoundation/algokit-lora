import { AssetId } from '../data/types'
import { replaceIpfsWithGatewayIfNeeded } from './replace-ipfs-with-gateway-if-needed'

// When the URL contains #arc3 or @arc3, it follows ARC-3
export const isArc3Url = (assetUrl: string) => assetUrl.includes('#arc3') || assetUrl.includes('@arc3')

export const getArc3Url = (assetId: AssetId, url: string): string => {
  return replaceIpfsWithGatewayIfNeeded(url.replace('{id}', assetId.toString()))
}
