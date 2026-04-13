import { atom } from 'jotai'
import { indexer } from '@/features/common/data/algo-client'
import { getApplicationAddress } from '@algorandfoundation/algokit-utils/common'
import { settingsStore } from '@/features/settings/data'
import { selectedNetworkAtomId } from '@/features/network/data'
import { betanetId, mainnetId, NetworkId, testnetId } from '@/features/network/data/types'

// ARC-54 burn app IDs per network
// See https://dev.algorand.co/arc-standards/arc-0054/
const arc54AppIds: Partial<Record<NetworkId, bigint>> = {
  [mainnetId]: 1257620981n,
  [testnetId]: 497806551n,
  [betanetId]: 2019020358n,
}

export const getArc54AppId = (): bigint | undefined => {
  const networkId = settingsStore.get(selectedNetworkAtomId)
  return arc54AppIds[networkId]
}

export const createAssetBurnedSupplyAtom = (assetId: bigint) => {
  return atom(async () => {
    const appId = getArc54AppId()
    if (!appId) return undefined

    const burnAddress = getApplicationAddress(appId)

    try {
      const result = await indexer.lookupAccountAssets(burnAddress, { assetId })
      const holding = result.assets?.[0]
      if (!holding) return undefined
      return holding.amount
    } catch {
      return undefined
    }
  })
}
