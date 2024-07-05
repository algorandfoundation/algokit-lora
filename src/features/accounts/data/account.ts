import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Address } from './types'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { asAccount } from '../mappers'
import { accountResultsAtom, getAccountResultAtom } from './account-result'
import { assetSummaryResolver } from '@/features/assets/data'
import { atomEffect } from 'jotai-effect'

const createAccountAtoms = (address: Address) => {
  const isStaleAtom = atom(false)
  const detectIsStaleEffect = atomEffect((get, set) => {
    const accountResults = get(accountResultsAtom)
    const isStale = accountResults.get(address) === undefined
    set(isStaleAtom, isStale)
  })

  return [
    atomWithRefresh(async (get) => {
      const accountResult = await get(getAccountResultAtom(address))
      get(detectIsStaleEffect)
      return asAccount(accountResult, assetSummaryResolver)
    }),
    isStaleAtom,
  ] as const
}

const useAccountAtoms = (address: Address) => {
  return useMemo(() => {
    return createAccountAtoms(address)
  }, [address])
}

export const useLoadableAccount = (address: Address) => {
  const [accountAtom, isStaleAtom] = useAccountAtoms(address)
  return [useAtomValue(loadable(accountAtom)), useSetAtom(accountAtom), useAtomValue(isStaleAtom)] as const
}
