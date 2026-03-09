import { Asset, AssetStandard } from '@/features/assets/models'
import { useCallback, useMemo } from 'react'
import { atom, useAtomValue } from 'jotai/index'
import { activeWalletAccountAtom } from '@/features/wallet/data/active-wallet'
import { loadable, useAtomCallback } from 'jotai/utils'
import { algorandClient } from '@/features/common/data/algo-client'
import { toast } from 'react-toastify'
import { asError } from '@/utils/error'
import { AsaMetadataRegistry, AssetMetadata, generated } from '@algorandfoundation/asa-metadata-registry-sdk'
import { getArc89RegistryAppId } from './arc89-registry'
import { AssetMetadataResult } from './types'
import { getAssetMetadataResultAtom } from './asset-metadata'
import { getAssetResultAtom } from './asset-result'
import { Address } from '@algorandfoundation/algokit-utils'

const hasExistingMetadata = (asset: Asset): boolean => {
  return (
    asset.standardsUsed.includes(AssetStandard.ARC3) ||
    asset.standardsUsed.includes(AssetStandard.ARC19) ||
    asset.standardsUsed.includes(AssetStandard.ARC69)
  )
}

const buildMetadataJson = (metadataResult: AssetMetadataResult): Record<string, unknown> | undefined => {
  if (!metadataResult) return undefined

  // Prefer ARC-3/19 metadata (richer), fall back to ARC-69
  if (metadataResult.arc3?.metadata) {
    return metadataResult.arc3.metadata as Record<string, unknown>
  }
  if (metadataResult.arc69?.metadata) {
    return metadataResult.arc69.metadata as Record<string, unknown>
  }
  return undefined
}

export const useArc89Migration = (asset: Asset) => {
  const registryAppId = getArc89RegistryAppId()

  const status = useMemo(() => {
    return atom(async (get) => {
      const activeAccount = await get(activeWalletAccountAtom)

      if (!registryAppId || !activeAccount) {
        return { canMigrate: false, hasActiveAccount: !!activeAccount }
      }

      const isManager = activeAccount.address === asset.manager
      const hasMetadata = hasExistingMetadata(asset)
      const alreadyRegistered = !!asset.arc89Metadata

      return {
        canMigrate: isManager && hasMetadata && !alreadyRegistered,
        hasActiveAccount: !!activeAccount,
      }
    })
  }, [asset, registryAppId])

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
          const metadataJson = buildMetadataJson(metadataResult)

          if (!metadataJson) {
            toast.error('No metadata found to migrate')
            return
          }

          // Determine if ARC-3 compliant
          const isArc3 =
            asset.standardsUsed.includes(AssetStandard.ARC3) || asset.standardsUsed.includes(AssetStandard.ARC19)

          // Create the AssetMetadata object
          const assetMetadata = AssetMetadata.fromJson({
            assetId: asset.id,
            jsonObj: metadataJson,
            arc3Compliant: isArc3,
          })

          // Create write-capable registry client
          const appClient = new generated.AsaMetadataRegistryClient({
            appId: registryAppId,
            algorand: algorandClient,
          })
          const registry = AsaMetadataRegistry.fromAppClient(appClient)

          // Write metadata to registry
          await registry.write.createMetadata({
            assetManager: {
              addr: Address.fromString(activeAccount.address),
              signer: algorandClient.account.getSigner(activeAccount.address),
            },
            metadata: assetMetadata,
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

  return {
    status: useAtomValue(loadable(status)),
    migrate,
  }
}
