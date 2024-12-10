import { atom, useAtomValue, useSetAtom } from 'jotai'
import { algorandClient } from '@/features/common/data/algo-client'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'
import { Address } from '@/features/accounts/data/types'
import { useEffect, useMemo } from 'react'
import { atomEffect } from 'jotai-effect'
import algosdk from 'algosdk'
import { getNfdResultAtom } from '@/features/nfd/data/nfd-result'

const activeWalletAddressAtom = atom<Promise<Address | undefined> | (Address | undefined)>(new Promise<Address | undefined>(() => {}))
export const activeWalletAccountAtom = atomWithRefresh<Promise<ActiveWalletAccount | undefined>>(async (get) => {
  const activeWalletAddress = await get(activeWalletAddressAtom)
  if (activeWalletAddress) {
    const nfdResult = await get(getNfdResultAtom({ address: activeWalletAddress, resolveNow: true }))
    return { nfd: nfdResult?.name ?? null, ...(await getActiveWalletAccount(activeWalletAddress)) }
  } else {
    return undefined
  }
})

export const useSetActiveWalletState = (activeAddress: string | undefined, signer: algosdk.TransactionSigner) => {
  const setActiveWalletAddress = useSetAtom(activeWalletAddressAtom)
  useEffect(() => {
    setActiveWalletAddress(activeAddress)
    algorandClient.setDefaultSigner(signer)
  }, [setActiveWalletAddress, activeAddress, signer])
}

const getActiveWalletAccount = async (address: string) => {
  const accountInformation = await algorandClient.account.getInformation(address)
  const assetHolding = accountInformation?.assets ?? []

  return {
    address: address,
    assetHolding: new Map(assetHolding.map((asset) => [asset.assetId, { amount: asset.amount }])),
    algoHolding: {
      amount: accountInformation.balance.microAlgo,
    },
    minBalance: Number(accountInformation.minBalance.microAlgo),
    validAtRound: Number(accountInformation.validAsOfRound),
  } satisfies Omit<ActiveWalletAccount, 'nfd'>
}

export const useLoadableActiveWalletAccount = () => {
  return useAtomValue(loadable(activeWalletAccountAtom))
}

const useActiveWalletAccountSnapshotAtom = () => {
  return useMemo(() => {
    const activeAccountAtom = atom<Promise<ActiveWalletAccount | undefined> | ActiveWalletAccount | undefined>(
      new Promise<ActiveWalletAccount | undefined>(() => {})
    )
    const snapshotActiveAccountEffect = atomEffect((get, set) => {
      ;(async () => {
        const activeWalletAccount = await get(activeWalletAccountAtom)
        set(activeAccountAtom, activeWalletAccount)
      })()
    })
    return [activeAccountAtom, snapshotActiveAccountEffect] as const
  }, [])
}

export const useLoadableActiveWalletAccountSnapshotAtom = () => {
  const [activeWalletAccountAtom, snapshotActiveAccountEffect] = useActiveWalletAccountSnapshotAtom()
  useAtomValue(snapshotActiveAccountEffect)
  return useAtomValue(loadable(activeWalletAccountAtom))
}
