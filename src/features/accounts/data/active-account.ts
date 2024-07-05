import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'
import { atom } from 'jotai'
import { getAccountInformation } from '@algorandfoundation/algokit-utils'
import { algod } from '@/features/common/data/algo-client'

export type ActiveAccount = {
  address: Address
  assetHolding: Map<AssetId, AccountAssetHolding>
}

type AccountAssetHolding = {
  amount: number | bigint
}

// TODO: rename to activeWalletAccount?
export const activeAccountAtom = atom<ActiveAccount | undefined>(undefined)
export const isActiveAccountStaleAtom = atom(false)

export const getActiveAccount = async (address: string) => {
  const accountInformation = await getAccountInformation(address, algod)
  const assetHolding = accountInformation?.assets ?? []

  return {
    address: address,
    // TODO: check if the assetId is a number or bigint
    assetHolding: new Map(assetHolding.map((asset) => [Number(asset.assetId), { amount: asset.amount }])),
  }
}
