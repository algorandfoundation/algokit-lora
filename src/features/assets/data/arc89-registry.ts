import { AsaMetadataRegistry } from '@algorandfoundation/asa-metadata-registry-sdk'
import { algod } from '@/features/common/data/algo-client'
import { settingsStore } from '@/features/settings/data'
import { selectedNetworkAtomId } from '@/features/network/data'
import { testnetId, mainnetId, NetworkId, localnetId } from '@/features/network/data/types'

// ARC-89 registry App IDs per network
// MainNet App ID is TBD - not yet deployed
const registryAppIds: Partial<Record<NetworkId, bigint>> = {
  [testnetId]: 753324084n,
  [mainnetId]: undefined, // TBD
  [localnetId]: 1012n,
}

export const getArc89RegistryAppId = (): bigint | undefined => {
  const networkId = settingsStore.get(selectedNetworkAtomId)
  return registryAppIds[networkId]
}

export const createArc89ReadRegistry = (registryAppId: bigint): AsaMetadataRegistry => {
  return AsaMetadataRegistry.fromAlgod({ algod, appId: registryAppId })
}
