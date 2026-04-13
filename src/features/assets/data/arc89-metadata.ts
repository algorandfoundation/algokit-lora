import { AssetId } from './types'
import { getArc89RegistryAppId, createArc89ReadRegistry } from './arc89-registry'
import { AssetMetadataRecord, BoxNotFoundError } from '@algorandfoundation/asa-metadata-registry-sdk'

export const fetchArc89Metadata = async (assetId: AssetId): Promise<AssetMetadataRecord | undefined> => {
  const registryAppId = getArc89RegistryAppId()
  if (!registryAppId) return undefined

  try {
    const registry = createArc89ReadRegistry(registryAppId)
    return await registry.read.getAssetMetadata({ assetId, appId: registryAppId })
  } catch (e) {
    if (e instanceof BoxNotFoundError) return undefined
    // eslint-disable-next-line no-console
    console.error('Failed to fetch ARC-89 metadata', e)
    return undefined
  }
}
