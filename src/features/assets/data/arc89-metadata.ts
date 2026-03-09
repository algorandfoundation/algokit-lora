import { Arc89MetadataResult, AssetId } from './types'
import { getArc89RegistryAppId, createArc89ReadRegistry } from './arc89-registry'
import { BoxNotFoundError } from '@algorandfoundation/asa-metadata-registry-sdk'

export const fetchArc89Metadata = async (assetId: AssetId): Promise<Arc89MetadataResult | undefined> => {
  const registryAppId = getArc89RegistryAppId()
  if (!registryAppId) return undefined

  try {
    const registry = createArc89ReadRegistry(registryAppId)
    const record = await registry.read.getAssetMetadata({ assetId, appId: registryAppId })

    return {
      appId: record.appId,
      assetId: record.assetId,
      body: record.json,
      flags: {
        reversible: {
          arc20: record.header.flags.reversible.arc20,
          arc62: record.header.flags.reversible.arc62,
          ntt: record.header.flags.reversible.ntt,
        },
        irreversible: {
          arc3: record.header.flags.irreversible.arc3,
          arc89: record.header.flags.irreversible.arc89Native,
          arc54: record.header.flags.irreversible.burnable,
          immutable: record.header.flags.irreversible.immutable,
        },
      },
      header: {
        hash: record.header.metadataHash,
        lastModifiedRound: record.header.lastModifiedRound,
        deprecatedBy: record.header.deprecatedBy === 0n ? undefined : record.header.deprecatedBy,
        isShort: record.header.isShort,
      },
    }
  } catch (e) {
    if (e instanceof BoxNotFoundError) return undefined
    // eslint-disable-next-line no-console
    console.error('Failed to fetch ARC-89 metadata', e)
    return undefined
  }
}
