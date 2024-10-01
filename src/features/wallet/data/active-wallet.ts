import { atom, useAtomValue, useSetAtom } from 'jotai'
import { algorandClient } from '@/features/common/data/algo-client'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'
import { Address } from '@/features/accounts/data/types'
import { useEffect, useMemo } from 'react'
import { atomEffect } from 'jotai-effect'
import algosdk from 'algosdk'

const activeWalletAddressAtom = atom<Promise<Address | undefined> | (Address | undefined)>(new Promise<Address | undefined>(() => {}))
export const activeWalletAccountAtom = atomWithRefresh<Promise<ActiveWalletAccount | undefined>>(async (get) => {
  const activeWalletAddress = await get(activeWalletAddressAtom)
  if (activeWalletAddress) {
    return await getActiveWalletAccount(activeWalletAddress)
  } else {
    return undefined
  }
})

export const useSetActiveWalletState = (isReady: boolean, activeAddress: string | undefined, signer: algosdk.TransactionSigner) => {
  const setActiveWalletAddress = useSetAtom(activeWalletAddressAtom)
  useEffect(() => {
    if (isReady) {
      setActiveWalletAddress(activeAddress)
      algorandClient.setDefaultSigner(signer)
    }
  }, [setActiveWalletAddress, activeAddress, isReady, signer])
}

const getActiveWalletAccount = async (address: string) => {
  const accountInformation = await algorandClient.account.getInformation(address)
  const assetHolding = accountInformation?.assets ?? []

  return {
    address: address,
    // In algosdk, the asset ID has type bigint | number
    // but in lora, we use number only
    assetHolding: new Map(assetHolding.map((asset) => [Number(asset.assetId), { amount: asset.amount }])),
    algoHolding: {
      amount: accountInformation.balance.microAlgo,
    },
    minBalance: Number(accountInformation.minBalance.microAlgo),
    validAtRound: Number(accountInformation.validAsOfRound),
  } satisfies ActiveWalletAccount
}

export const useLoadableActiveWalletAccount = () => {
  return useAtomValue(loadable(activeWalletAccountAtom))
}

const useActiveWalletAddressSnapshotAtom = () => {
  return useMemo(() => {
    const activeAddressAtom = atom<Promise<string | undefined> | string | undefined>(new Promise<string | undefined>(() => {}))
    const snapshotActiveAddressEffect = atomEffect((get, set) => {
      ;(async () => {
        const activeWalletAccount = await get.peek(activeWalletAccountAtom)
        set(activeAddressAtom, activeWalletAccount?.address)
      })()
    })
    return [activeAddressAtom, snapshotActiveAddressEffect] as const
  }, [])
}

export const useLoadableActiveWalletAddressSnapshotAtom = () => {
  const [activeWalletAddressAtom, snapshotActiveAddressEffect] = useActiveWalletAddressSnapshotAtom()
  useAtomValue(snapshotActiveAddressEffect)
  return useAtomValue(loadable(activeWalletAddressAtom))
}
