import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'
import { atom } from 'jotai'
import { getAccountInformation } from '@algorandfoundation/algokit-utils'
import { algod } from '@/features/common/data/algo-client'
import { Account as WalletAccount } from '@txnlab/use-wallet'
import { atomWithRefresh } from 'jotai/utils'
import { atomEffect } from 'jotai-effect'

export type ActiveAccount = {
  address: Address
  assetHolding: Map<AssetId, AccountAssetHolding>
}

type AccountAssetHolding = {
  amount: number | bigint
}

export const walletAccountAtom = atom<WalletAccount | undefined>(undefined)
// TODO: rename to activeWalletAccount?
export const isActiveAccountStaleAtom = atom(false)
export const activeAccountAtom = atomWithRefresh<Promise<ActiveAccount | undefined>>(async (get) => {
  get(activeAccountStaleEffect)

  const walletAccount = get(walletAccountAtom)
  if (walletAccount) {
    return await getActiveAccount(walletAccount.address)
  } else {
    return undefined
  }
})

export const getActiveAccount = async (address: string) => {
  const accountInformation = await getAccountInformation(address, algod)
  const assetHolding = accountInformation?.assets ?? []

  return {
    address: address,
    // TODO: check if the assetId is a number or bigint
    assetHolding: new Map(assetHolding.map((asset) => [Number(asset.assetId), { amount: asset.amount }])),
  }
}

export const activeAccountStaleEffect = atomEffect((get, set) => {
  const isStale = get(isActiveAccountStaleAtom)
  if (isStale) {
    set(isActiveAccountStaleAtom, false)
    set(activeAccountAtom)
  }
})
