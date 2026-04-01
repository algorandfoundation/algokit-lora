import { Asset, AssetStandard } from '@/features/assets/models'
import { useCallback } from 'react'
import { activeWalletAccountAtom } from '@/features/wallet/data/active-wallet'
import { useAtomCallback } from 'jotai/utils'
import { algorandClient } from '@/features/common/data/algo-client'
import { toast } from 'react-toastify'
import { asError } from '@/utils/error'
import { AsaMetadataRegistry, generated, migrateLegacyMetadataToRegistry } from '@algorandfoundation/asa-metadata-registry-sdk'
import { getArc89RegistryAppId } from './arc89-registry'
import { AssetMetadataResult } from './types'
import { getAssetMetadataResultAtom } from './asset-metadata'
import { getAssetResultAtom } from './asset-result'
import { Address } from '@algorandfoundation/algokit-utils'
import { AddressWithSigners } from '@algorandfoundation/algokit-utils/transact'

const buildMetadataJson = (metadataResult: AssetMetadataResult): Record<string, unknown> | undefined => {
  if (!metadataResult) return undefined

  // Prefer ARC-3/19 metadata (richer), fall back to ARC-69
  if (metadataResult.arc3?.metadata) {
    return metadataResult.arc3.metadata
  }
  if (metadataResult.arc69?.metadata) {
    return metadataResult.arc69.metadata
  }

  return undefined
}

export const useArc89Migration = (asset: Asset) => {
  const registryAppId = getArc89RegistryAppId()

  const migrate = useAtomCallback(
    useCallback(
      async (get) => {
        if (!registryAppId) return

        const activeAccount = await get(activeWalletAccountAtom)
        if (!activeAccount) return

        try {
          // Fetch the existing metadata
          const assetResult = await get(getAssetResultAtom(asset.id))
          const metadataResult = await get(getAssetMetadataResultAtom(assetResult))
          const metadataJson = buildMetadataJson(metadataResult) ?? {}

          const isArc3 = asset.standardsUsed.includes(AssetStandard.ARC3) || asset.standardsUsed.includes(AssetStandard.ARC19)

          const appClient = new generated.AsaMetadataRegistryClient({
            appId: registryAppId,
            algorand: algorandClient,
            defaultSender: Address.fromString(activeAccount.address),
          })
          const registry = AsaMetadataRegistry.fromAppClient(appClient)

          await migrateLegacyMetadataToRegistry({
            registry,
            assetManager: {
              addr: Address.fromString(activeAccount.address),
              signer: algorandClient.account.getSigner(activeAccount.address),
            } as AddressWithSigners,
            assetId: asset.id,
            metadata: metadataJson,
            arc3Compliant: isArc3,
          })

          toast.success('Metadata successfully migrated to ARC-89 registry')
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ARC-89 migration failed', e)
          toast.error(asError(e).message)
        }
      },
      [asset, registryAppId]
    )
  )

  return { migrate }
}
