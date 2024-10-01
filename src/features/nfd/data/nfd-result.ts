import { readOnlyAtomCache } from '@/features/common/data'
import { Getter, Setter } from 'jotai'
import { Nfd, NfdResult } from './types'

const getNfdResult = async (_: Getter, __: Setter, nfd: Nfd) => {
  try {
    const response = await fetch(`https://api.nf.domains/nfd/${nfd}`, {
      method: 'GET',
      headers: {},
    })
    const data = await response.json()
    return {
      name: nfd,
      address: data.owner,
    } as NfdResult
  } catch (e: unknown) {
    throw new Error('NFD not found')
  }
}

export const [nfdResultsAtom, getNfdResultAtom] = readOnlyAtomCache(getNfdResult, (nfd) => nfd)
