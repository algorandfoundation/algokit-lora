import { AppClientMethodCallParamsArgs } from '@/features/applications/data/types'
import { algorandClient } from '@/features/common/data/algo-client'
import { FEE_SINK_ADDRESS } from '@/features/network/data'
import { ABIMethod } from 'algosdk'

export async function executeFundedDiscoveryApplicationCall(
  applicationMethod: ABIMethod,
  applicationId: bigint,
  applicationCallArgs?: AppClientMethodCallParamsArgs[]
) {
  // Create a transaction composer to call the method
  const composer = algorandClient.newGroup()

  // Add the method call to the composer
  composer.addAppCallMethodCall({
    appId: applicationId,
    method: applicationMethod,
    args: applicationCallArgs,
    sender: FEE_SINK_ADDRESS,
  })
  const simulateResult = await composer.simulate({ skipSignatures: true, allowUnnamedResources: true })

  return simulateResult
}
