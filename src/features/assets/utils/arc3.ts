import { AssetId } from '../data/types'

// Check if the asset details follow ARC-3
export const isArc3Url = (assetUrl: string, assetName: string | undefined) =>
  assetUrl.endsWith('#arc3') || (assetName && (assetName === 'arc3' || assetName.endsWith('@arc3')))

export const getArc3Url = (assetId: AssetId, url: string): string => {
  let result = url.replace('{id}', assetId.toString())
  if (result.endsWith('#arc3')) {
    result = result.slice(0, -5)
  }
  return result
}
