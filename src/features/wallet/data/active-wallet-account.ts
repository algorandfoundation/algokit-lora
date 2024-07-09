import { atom, useSetAtom } from 'jotai'
import { getAccountInformation } from '@algorandfoundation/algokit-utils'
import { algod } from '@/features/common/data/algo-client'
import { atomWithRefresh } from 'jotai/utils'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet-account'
import { Address } from '@/features/accounts/data/types'
import { useEffect } from 'react'

const activeWalletAddressAtom = atom<Address | undefined>(undefined)
export const activeWalletAccountAtom = atomWithRefresh<Promise<ActiveWalletAccount | undefined>>(async (get) => {
  const activeWalletAddress = get(activeWalletAddressAtom)
  if (activeWalletAddress) {
    return await getActiveWalletAccount(activeWalletAddress)
  } else {
    return undefined
  }
})

export const useSetActiveWalletAddress = (activeAddress: string | undefined) => {
  const setActiveWalletAddress = useSetAtom(activeWalletAddressAtom)
  useEffect(() => {
    setActiveWalletAddress(activeAddress)
  }, [setActiveWalletAddress, activeAddress])
}

export const getActiveWalletAccount = async (address: string) => {
  const accountInformation = await getAccountInformation(address, algod)
  const assetHolding = accountInformation?.assets ?? []

  return {
    address: address,
    // In algosdk, the asset ID has type bigint | number
    // but in lora, we use number only
    assetHolding: new Map(assetHolding.map((asset) => [Number(asset.assetId), { amount: asset.amount }])),
    validAtRound: accountInformation.round,
  } satisfies ActiveWalletAccount
}
