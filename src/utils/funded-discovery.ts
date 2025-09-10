import { AppClientMethodCallParamsArgs } from '@/features/applications/data/types'
import { algorandClient } from '@/features/common/data/algo-client'
import { fundedDiscoveryAddressAtom } from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'
import { ABIMethod, Address } from 'algosdk'

export async function executeFundedDiscoveryApplicationCall(
  applicationMethod: ABIMethod,
  applicationId: bigint,
  applicationCallArgs?: AppClientMethodCallParamsArgs[]
) {
  const fundedDiscoveryAddress: string | Address = await settingsStore.get(fundedDiscoveryAddressAtom)

  const composer = algorandClient.newGroup()
  composer.addAppCallMethodCall({
    appId: applicationId,
    method: applicationMethod,
    args: applicationCallArgs,
    sender: fundedDiscoveryAddress,
  })
  const simulateResult = await composer.simulate({ skipSignatures: true, allowUnnamedResources: true })

  return simulateResult
}
