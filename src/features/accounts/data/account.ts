import { atom, useAtomValue, useStore } from 'jotai'
import { Address } from './types'
import { loadable } from 'jotai/utils'
import { JotaiStore } from '@/features/common/data/types'
import { useMemo } from 'react'
import { asAccount } from '../mappers'
import { getAccountResultAtom } from './account-result'

const createAccountAtom = (store: JotaiStore, address: Address) => {
  return atom(async (get) => {
    const accountResult = await get(getAccountResultAtom(store, address))
    return asAccount(accountResult)
  })
}

const useAccountAtom = (address: Address) => {
  const store = useStore()

  return useMemo(() => {
    return createAccountAtom(store, address)
  }, [store, address])
}

export const useLoadableAccountAtom = (address: Address) => {
  return useAtomValue(loadable(useAccountAtom(address)))
}
