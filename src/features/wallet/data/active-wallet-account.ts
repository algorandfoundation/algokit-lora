import { atom } from 'jotai'
import { getAccountInformation } from '@algorandfoundation/algokit-utils'
import { algod } from '@/features/common/data/algo-client'
import { Account as WalletAccount } from '@txnlab/use-wallet'
import { atomWithRefresh } from 'jotai/utils'
import { atomEffect } from 'jotai-effect'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet-account'

export const walletAccountAtom = atom<WalletAccount | undefined>(undefined)

export const isActiveWalletAccountStaleAtom = atom(false)
export const activeWalletAccountAtom = atomWithRefresh<Promise<ActiveWalletAccount | undefined>>(async (get) => {
  get(activeWalletAccountStaleEffect)

  const walletAccount = get(walletAccountAtom)

  if (walletAccount) {
    return await getActiveWalletAccount(walletAccount.address)
  } else {
    return undefined
  }
})

export const getActiveWalletAccount = async (address: string) => {
  const accountInformation = await getAccountInformation(address, algod)
  const assetHolding = accountInformation?.assets ?? []

  return {
    address: address,
    // In algosdk, the asset ID has type bigint | number
    // but in lora, we use number only
    assetHolding: new Map(assetHolding.map((asset) => [Number(asset.assetId), { amount: asset.amount }])),
  }
}

export const activeWalletAccountStaleEffect = atomEffect((get, set) => {
  const isStale = get(isActiveWalletAccountStaleAtom)
  if (isStale) {
    set(isActiveWalletAccountStaleAtom, false)
    set(activeWalletAccountAtom)
  }
})
