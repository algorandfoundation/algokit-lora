import { Arc3MetadataResult } from '../data/types'

// Checks if the asset metadata has the ARC-62 property in the correct place
// Returns the ARC-62 application ID if present, otherwise undefined
export const getArc62AppId = (asset: Arc3MetadataResult): bigint | undefined => {
  const arc62 = asset?.metadata?.properties?.['arc-62']
  if (!arc62 || typeof arc62 !== 'object' || Array.isArray(arc62)) return undefined

  const appId = (arc62 as Record<string, unknown>)['application-id']
  if (typeof appId === 'number' && Number.isInteger(appId) && appId >= 0) {
    return BigInt(appId)
  }
  if (typeof appId === 'string' && /^\d+$/.test(appId)) {
    return BigInt(appId)
  }

  return undefined
}
