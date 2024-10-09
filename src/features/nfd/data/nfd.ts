import { Address } from '@/features/accounts/data/types'
import { atom, useAtomValue } from 'jotai'
import { getNfdResultAtom } from './nfd-result'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'

const createNfdAtoms = (address: Address) => {
  return [
    atom(async (get) => {
      const nfdResult = await get(getNfdResultAtom({ address: address }))
      if (!nfdResult) {
        return null
      }
      return nfdResult
    }),
  ] as const
}

export const useNfdAtoms = (address: Address) => {
  return useMemo(() => {
    return createNfdAtoms(address)
  }, [address])
}

export const useLoadableNfd = (address: Address) => {
  const [nfdAtom] = useNfdAtoms(address)
  return [useAtomValue(loadable(nfdAtom))] as const
}
