import { algorandClient, indexer } from '@/features/common/data/algo-client'
import algosdk from 'algosdk'
import { Arc3MetadataResult } from '../data/types'
import { uint8ArrayToUtf8 } from '@/utils/uint8-array-to-utf8'

// Checks if the asset metadata has the ARC-62 property in the correct place
export const isArc62 = (asset: Arc3MetadataResult): boolean => {
  if (!asset?.metadata?.properties) return false

  const arc62 = asset.metadata.properties['arc-62'] as { 'application-id'?: number }

  return arc62?.['application-id'] !== undefined
}

// TODO Arthur - Refactor this - Try to make funded account application discovery more reusable
export const getArc62CirculatingSupply = async (applicationId: bigint, assetId: bigint) => {
  const arc62GetCirculatingSupplyMethod = algosdk.ABIMethod.fromSignature('arc62_get_circulating_supply(uint64)uint64')
  try {
    // Fetch appplication data to define both creator and burner addresses in order to populate the method call
    const arc62ContractData = await indexer.lookupApplications(applicationId).do()

    // I can prolly improve error managing using some existing logger
    if (!arc62ContractData.application) {
      throw new Error(`Application with ID ${applicationId} not found.`)
    }

    // Fetch the global state to get the burned address
    const globalAppState = arc62ContractData.application?.params.globalState ?? []

    // Decode the global state to get the burned address to populate the method call
    const decodedState = decodeAppState(globalAppState)
    const burnedAddress = decodedState.burned.toString()

    if (!burnedAddress) {
      throw new Error(`Burned address not found in application ${applicationId} global state.`)
    }

    const simulateResult = await executeFundedDiscoveryApplicationCall(arc62GetCirculatingSupplyMethod, applicationId, [assetId])
    await getArc62BurnedSupply(applicationId, assetId)
    if (!simulateResult.returns?.[0]) return
    const methodResult = simulateResult.returns[0].returnValue
    console.log('circulating supply response', methodResult)
    return methodResult
  } catch (error) {
    console.error('Error fetching circulating supply:', error)
  }
}

export const getArc62BurnedSupply = async (applicationId: bigint, assetId: bigint) => {
  // Fetch appplication data to define both creator and burner addresses in order to populate the method call
  const arc62ContractData = await indexer.lookupApplications(applicationId).do()

  const globalAppState = arc62ContractData.application?.params.globalState ?? []

  // Decode the global state to get the burned address to populate the method call
  const decodedState = decodeAppState(globalAppState)
  const burnedAddress = decodedState.burned.toString()
  console.log('burnedAddress', burnedAddress)

  const burnedAsset = await indexer.lookupAccountAssets(burnedAddress).assetId(assetId).do()
  console.log('burnedAsset', burnedAsset)

  const burnedSupply = burnedAsset.assets?.[0]?.amount ?? 0

  return burnedSupply
}

// helper to decode state
function decodeAppState(globalState: any[]) {
  const decoded: Record<string, string | number> = {}

  globalState.forEach(({ key, value }) => {
    const decodedKey = uint8ArrayToUtf8(key)

    if (value.type === 1) {
      // value.bytes contains base64 string of the address
      const raw = Buffer.from(value.bytes, 'base64')
      const address = algosdk.encodeAddress(raw)
      decoded[decodedKey] = address
    } else if (value.type === 2) {
      decoded[decodedKey] = value.uint
    }
  })

  return decoded
}

// Abstracts the logic to execute a funded discovery application call to be more reusable
export async function executeFundedDiscoveryApplicationCall(
  applicationMethod: algosdk.ABIMethod,
  applicationId: bigint,
  applicationCallArgs?: any[]
) {
  // Using a fee sink address to call the method - simulating will check if caller account has balance
  const feeSinkAddress = 'Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA'

  // Create a transaction composer to call the method
  const composer = algorandClient.newGroup()

  // Add the method call to the composer
  composer.addAppCallMethodCall({
    appId: applicationId,
    method: applicationMethod,
    args: applicationCallArgs,
    sender: feeSinkAddress,
  })
  const simulateResult = await composer.simulate({ skipSignatures: true, allowUnnamedResources: true })

  console.log('simulateResult', simulateResult)

  return simulateResult
}
