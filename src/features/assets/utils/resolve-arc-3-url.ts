import { AssetIndex } from '../data/types'

export const resolveArc3Url = (assetIndex: AssetIndex, url: string): string => {
  return url.replace('ipfs://', 'https://ipfs.algonode.xyz/ipfs/').replace('{id}', assetIndex.toString())
}
