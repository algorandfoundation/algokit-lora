import { atom } from 'jotai'
import { getNfdResultAtom, getReverseNfdResultAtom } from './nfd-result'
import { Nfd } from './types'
import { asNfdSummary } from '../mappers/nfd-summary'
import { Address } from '@/features/accounts/data/types'

export const nfdSummaryResolver = (nfd: Nfd) => {
  return createNfdSummaryAtom(nfd)
}

export const createNfdSummaryAtom = (nfd: Nfd) => {
  return atom(async (get) => {
    const nfdResult = await get(getNfdResultAtom(nfd))
    return asNfdSummary(nfdResult)
  })
}

export const reverseNfdSummaryResolver = (address: Address) => {
  return createReverseNfdSummaryAtom(address)
}

export const createReverseNfdSummaryAtom = (address: Address) => {
  return atom(async (get) => {
    const nfdResult = await get(getReverseNfdResultAtom(address))
    return asNfdSummary(nfdResult)
  })
}
