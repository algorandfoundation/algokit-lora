import { Address } from '@/features/accounts/data/types'
import { useAtomValue } from 'jotai'
import { useNfdAtom, useNfdResultAtom } from './nfd-result'
import { loadable } from 'jotai/utils'
import { Nfd } from './types'

export const useLoadableNfd = (address: Address) => {
  const nfdAtom = useNfdAtom(address)
  return [useAtomValue(loadable(nfdAtom))] as const
}

export const useLoadableNfdResult = (nfd: Nfd) => {
  const nfdAtom = useNfdResultAtom(nfd)
  return [useAtomValue(loadable(nfdAtom))] as const
}
