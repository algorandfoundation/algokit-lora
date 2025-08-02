import { algorandClient } from '@/features/common/data/algo-client'
import { ABIMethod } from 'algosdk'

export async function executeFundedDiscoveryApplicationCall(
  applicationMethod: ABIMethod,
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
