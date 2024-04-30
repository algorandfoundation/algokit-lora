import { AssetIndex } from '../data/types'
import { getHttpUrlFromIpfs } from './get-http-url-from-ipfs'

export const getArc3MetadataUrl = (assetIndex: AssetIndex, url: string): string => {
  return getHttpUrlFromIpfs(url.replace('{id}', assetIndex.toString()))
}
