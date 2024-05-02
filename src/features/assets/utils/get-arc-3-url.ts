import { AssetIndex } from '../data/types'
import { replaceIpfsWithGatewayIfNeeded } from './replace-ipfs-with-gateway-if-needed'

export const getArc3Url = (assetIndex: AssetIndex, url: string): string => {
  return replaceIpfsWithGatewayIfNeeded(url.replace('{id}', assetIndex.toString()))
}
