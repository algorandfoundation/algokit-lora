import { Arc3MetadataResult } from '../data/types'

// Checks if the asset metadata has the ARC-62 property in the correct place
export const hasArc62Property = (asset: Arc3MetadataResult) => {
  return asset.metadata.properties?.['arc-62'] !== undefined
}

// Plaeholder function to get the circulating supply from the application ID
export const getArc62CirculatingSupply = (applicationId: number) => {
  const result = applicationId.toString().match(/arc62-(\d+)/)

  return result
}
