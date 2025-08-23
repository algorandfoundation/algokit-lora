import { AppClientMethodCallParamsArgs } from '@/features/applications/data/types'
import { algorandClient } from '@/features/common/data/algo-client'
import { FEE_SINK_ADDRESS, networkConfigAtom } from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'
import { ABIMethod, Address } from 'algosdk'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

export async function executeFundedDiscoveryApplicationCall(
  applicationMethod: ABIMethod,
  applicationId: bigint,
  applicationCallArgs?: AppClientMethodCallParamsArgs[]
) {
  let fundedDiscoveryAddress: string | Address

  const networkConfig = settingsStore.get(networkConfigAtom)

  if (!networkConfig.id) return

  fundedDiscoveryAddress = FEE_SINK_ADDRESS

  if (networkConfig.id === 'localnet') {
    const localnetClient = AlgorandClient.defaultLocalNet()

    fundedDiscoveryAddress = await localnetClient.account.fromEnvironment('FUNDED_DISCOVERY_ACCOUNT', (1).algo())
  }

  // Create a transaction composer to call the method
  const composer = algorandClient.newGroup()
  // Add the method call to the composer
  composer.addAppCallMethodCall({
    appId: applicationId,
    method: applicationMethod,
    args: applicationCallArgs,
    sender: fundedDiscoveryAddress,
  })
  const simulateResult = await composer.simulate({ skipSignatures: true, allowUnnamedResources: true })

  return simulateResult
}
