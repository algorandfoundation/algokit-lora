import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { atom } from 'jotai'
import { getApplicationResultAtom } from '@/features/applications/data'
import { fundedAccountAtom } from '@/features/accounts/data'
import { algorandClient } from '@/features/common/data/algo-client'

export const createAssetCirculatingSupplyAtom = (applicationId: bigint, assetId: bigint) => {
  return atom(async (get) => {
    const app = await get(getApplicationResultAtom(applicationId))
    if (!app) return undefined

    const fundedAddress = await get(fundedAccountAtom)
    if (!fundedAddress) return undefined

    const result = await algorandClient
      .newGroup()
      .addAppCallMethodCall({
        appId: applicationId,
        method: algosdk.ABIMethod.fromSignature('arc62_get_circulating_supply(uint64)uint64'),
        args: [assetId],
        sender: fundedAddress,
      })
      .simulate({ skipSignatures: true, allowUnnamedResources: true })

    const returnValue = result?.returns?.[0]?.returnValue
    if (returnValue == null) return undefined
    if (typeof returnValue === 'bigint') return returnValue
    if (typeof returnValue === 'string' || typeof returnValue === 'number') return BigInt(returnValue)
    return undefined
  })
}
