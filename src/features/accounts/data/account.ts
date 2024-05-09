import { atom, useAtomValue, useStore } from 'jotai'
import { AccountResult, Address } from './types'
import { loadable } from 'jotai/utils'
import { accountResultsAtom } from './core'
import { atomEffect } from 'jotai-effect'
import { JotaiStore } from '@/features/common/data/types'
import { algod } from '@/features/common/data'
import { useMemo } from 'react'
import { asAccount } from '../mappers'

const fetchAccountResultAtomBuilder = (address: Address) =>
  atom(async (_get) => {
    return await algod
      .accountInformation(address)
      .do()
      .then((result) => {
        return result as AccountResult
      })
  })

export const getAccountAtomBuilder = (store: JotaiStore, address: Address) => {
  const fetchAccountResultAtom = fetchAccountResultAtomBuilder(address)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const accountResult = await get(fetchAccountResultAtom)
        set(accountResultsAtom, (prev) => {
          return prev.set(accountResult.address, accountResult)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const accountResults = store.get(accountResultsAtom)
    const cachedAccountResult = accountResults.get(address)
    if (cachedAccountResult) {
      return asAccount(cachedAccountResult)
    }

    get(syncEffect)

    const accountResult = await get(fetchAccountResultAtom)
    return asAccount(accountResult)
  })
}

export const getAccountsAtomBuilder = (store: JotaiStore, addresses: Address[]) => {
  return atom((get) => {
    return Promise.all(addresses.map((address) => get(getAccountAtomBuilder(store, address))))
  })
}

const useAccountAtom = (address: Address) => {
  const store = useStore()

  return useMemo(() => {
    return getAccountAtomBuilder(store, address)
  }, [store, address])
}

export const useLoadableAccountAtom = (address: Address) => {
  return useAtomValue(loadable(useAccountAtom(address)))
}
