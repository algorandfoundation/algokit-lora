import { atom, useAtomValue } from 'jotai'
import { Address } from './types'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { asAccount } from '../mappers'
import { getAccountResultAtom } from './account-result'
import { assetSummaryResolver } from '@/features/assets/data'

const createAccountAtom = (address: Address) => {
  return atom(async (get) => {
    const accountResult = await get(getAccountResultAtom(address))
    return asAccount(accountResult, assetSummaryResolver)
  })
}

const useAccountAtom = (address: Address) => {
  return useMemo(() => {
    return createAccountAtom(address)
  }, [address])
}

export const useLoadableAccountAtom = (address: Address) => {
  return useAtomValue(loadable(useAccountAtom(address)))
}
