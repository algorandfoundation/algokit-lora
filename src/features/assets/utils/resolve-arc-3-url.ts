import { AssetIndex } from '../data/types'

export const resolveArc3Url = (assetIndex: AssetIndex, url: string): string => {
  return resolveIpfsUrl(url).replace('{id}', assetIndex.toString())
}

export const resolveIpfsUrl = (url: string): string => {
  return url.replace('ipfs://', 'https://ipfs.algonode.xyz/ipfs/')
}
