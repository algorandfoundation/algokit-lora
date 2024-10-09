import { Address } from '@/features/accounts/data/types'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { getNfdResultAtom } from './nfd-result'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { atomEffect } from 'jotai-effect'

const createNfdAtoms = (address: Address) => {
  const isStaleAtom = atom(false)
  const detectIsStaleEffect = atomEffect((get, set) => {
    const nfdResults = get(getNfdResultAtom({ address: address }))
    const isStale = nfdResults === undefined
    set(isStaleAtom, isStale)
  })

  return [
    atomWithRefresh(async (get) => {
      const nfdResult = await get(getNfdResultAtom({ address: address }))
      get(detectIsStaleEffect)
      if (!nfdResult) {
        return null
      }
      return nfdResult
    }),
    isStaleAtom,
  ] as const
}

export const useNfdAtoms = (address: Address) => {
  return useMemo(() => {
    return createNfdAtoms(address)
  }, [address])
}

export const useLoadableNfd = (address: Address) => {
  const [nfdAtom, isStaleAtom] = useNfdAtoms(address)
  return [useAtomValue(loadable(nfdAtom)), useSetAtom(nfdAtom), useAtomValue(isStaleAtom)] as const
}
