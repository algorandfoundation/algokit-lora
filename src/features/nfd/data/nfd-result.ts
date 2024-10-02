import { readOnlyAtomCache } from '@/features/common/data'
import { Getter, Setter } from 'jotai'
import { Nfd, NfdResult } from './types'
import { Address } from '@/features/accounts/data/types'

const getReverseNfdResult = async (_: Getter, __: Setter, address: Address) => {
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
  } catch (e) {
    throw new Error('Nfd is not found')
  }
}

const getNfdResult = async (_: Getter, __: Setter, nfd: Nfd) => {
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
    throw new Error('NFD not found')
  }
}

export const [nfdResultsAtom, getNfdResultAtom] = readOnlyAtomCache(getNfdResult, (nfd) => nfd)

export const [reverseNfdResultsAtom, getReverseNfdResultAtom] = readOnlyAtomCache(getReverseNfdResult, (address) => address)
