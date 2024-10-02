import { readOnlyAtomCache } from '@/features/common/data'
import { Getter, Setter } from 'jotai'
import { Nfd, NfdLookup, NfdResult } from './types'
import { Address } from '@/features/accounts/data/types'

const getReverseLookupNfdResult = async (_: Getter, __: Setter, address: Address) => {
  try {
    const response = await fetch(`https://api.nf.domains/nfd/lookup?address=${address}`, {
      method: 'GET',
      headers: {},
    })
    const data = await response.json()
    return {
      name: data[address].name,
      depositAccount: data[address].depositAccount,
      caAlgo: data[address].caAlgo[0],
      owner: data[address].owner,
    } as NfdResult
  } catch (e: unknown) {
    const error = new Error('Response not found') as Error & { status: number }
    error.status = 404
    throw error
  }
}

const getForwardLookupNfdResult = async (_: Getter, __: Setter, nfd: Nfd) => {
  try {
    const response = await fetch(`https://api.nf.domains/nfd/${nfd}`, {
      method: 'GET',
      headers: {},
    })
    const data = await response.json()
    return {
      name: data.name,
      depositAccount: data.depositAccount,
      caAlgo: data.caAlgo,
      owner: data.owner,
    } as NfdResult
  } catch (e: unknown) {
    throw e as 404
  }
}

export const getNfdResult = async (getter: Getter, setter: Setter, nfdLookup: NfdLookup) =>
  'address' in nfdLookup
    ? getReverseLookupNfdResult(getter, setter, nfdLookup.address)
    : getForwardLookupNfdResult(getter, setter, nfdLookup.nfd)

export const [forwardNfdResultsAtom, getForwardNfdResultAtom] = readOnlyAtomCache(getForwardLookupNfdResult, (nfd) => nfd)

export const [reverseNfdResultsAtom, getReverseNfdResultAtom] = readOnlyAtomCache(getReverseLookupNfdResult, (address) => address)
