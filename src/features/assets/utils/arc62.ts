import { algorandClient, indexer } from '@/features/common/data/algo-client'
import algosdk, { getApplicationAddress } from 'algosdk'
import { Arc3MetadataResult, Arc62MetadataResult } from '../data/types'
import { uint8ArrayToUtf8 } from '@/utils/uint8-array-to-utf8'
import { executeFundedDiscoveryApplicationCall } from '@/utils/funded-discovery'

// Checks if the asset metadata has the ARC-62 property in the correct place
export const isArc62 = (asset: Arc3MetadataResult): boolean => {
  if (!asset?.metadata?.properties) return false

  const arc62 = asset.metadata.properties['arc-62']

  if (!arc62) return false
  return arc62 !== undefined
}

// TODO Arthur - Refactor this - Try to make funded account application discovery more reusable
export const getArc62CirculatingSupply = async (applicationId: bigint, assetId: bigint) => {
  const arc62GetCirculatingSupplyMethod = algosdk.ABIMethod.fromSignature('arc62_get_circulating_supply(uint64)uint64')

  const arc62ContractData = await indexer.lookupApplications(applicationId).do()

  if (!arc62ContractData.application) {
    throw new Error(`Application with ID ${applicationId} not found.`)
  }

  const globalAppState = arc62ContractData.application?.params.globalState ?? []
  const decodedState = decodeAppState(globalAppState)
  const burnedAddress = decodedState.burned.toString()

  if (!burnedAddress) {
    throw new Error(`Burned address not found in application ${applicationId} global state.`)
  }

  const simulateResult = await executeFundedDiscoveryApplicationCall(arc62GetCirculatingSupplyMethod, applicationId, [assetId])

  await getArc62BurnedSupply(applicationId, assetId)

  if (!simulateResult.returns?.[0]) return
  return simulateResult.returns[0].returnValue
}

export const getArc62BurnedSupply = async (applicationId: bigint, assetId: bigint) => {
  // Fetch appplication data to define both creator and burner addresses in order to populate the method call
  const arc62ContractData = await indexer.lookupApplications(applicationId).do()

  const globalAppState = arc62ContractData.application?.params.globalState ?? []

  // Decode the global state to get the burned address to populate the method call
  const decodedState = decodeAppState(globalAppState)
  const burnedAddress = decodedState.burned.toString()

  const burnedAsset = await indexer.lookupAccountAssets(burnedAddress).assetId(assetId).do()

  const burnedSupply = burnedAsset.assets?.[0]?.amount ?? 0

  return burnedSupply
}

export const getArc62ReserveAddress = async (applicationId: bigint) => {
  const arc62ReserveAddress = getApplicationAddress(applicationId)
  return arc62ReserveAddress
}

// helper to decode state
export const decodeAppState = (globalState: algosdk.indexerModels.TealKeyValue[]) => {
  const decoded: Record<string, string | number | bigint> = {}

  globalState.forEach(({ key, value }) => {
    const decodedKey = uint8ArrayToUtf8(key)

    if (value.type === 1) {
      // value.bytes is a Uint8Array representing the address
      const address = algosdk.encodeAddress(value.bytes)
      decoded[decodedKey] = address
    } else if (value.type === 2) {
      decoded[decodedKey] = value.uint
    }
  })

  return decoded
}

export const parseArc62Metadata = (metadata: string | number | undefined): Arc62MetadataResult['metadata'] | null => {
  if (!metadata) return null

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  return null
}
