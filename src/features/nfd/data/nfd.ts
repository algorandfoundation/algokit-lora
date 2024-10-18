import { Address } from '@/features/accounts/data/types'
import { useAtomValue } from 'jotai'
import { useNfdResultAtom } from './nfd-result'
import { loadable } from 'jotai/utils'

export const useLoadableNfdResult = (address: Address) => {
  const nfdAtom = useNfdResultAtom(address)
  return [useAtomValue(loadable(nfdAtom))] as const
}
