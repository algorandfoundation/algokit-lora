import { Arc3MetadataResult } from '../data/types'

// Checks if the asset metadata has the ARC-62 property in the correct place
export const isArc62 = (asset: Arc3MetadataResult): boolean => {
  if (!asset?.metadata?.properties) return false

  const arc62 = asset.metadata.properties['arc-62'] as { 'application-id'?: number }

  return arc62?.['application-id'] !== undefined
}

// Plaeholder function to get the circulating supply from the application ID
export const getArc62CirculatingSupply = (applicationId: number) => {
  const result = applicationId.toString().match(/arc62-(\d+)/)

  return result
}
