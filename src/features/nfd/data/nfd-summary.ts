import { atom } from 'jotai'
import { getForwardNfdResultAtom, getReverseNfdResultAtom } from './nfd-result'
import { Nfd } from './types'
import { asNfdSummary } from '../mappers/nfd-summary'
import { Address } from '@/features/accounts/data/types'

export const forwardNfdSummaryResolver = (nfd: Nfd) => {
  return createForwardNfdSummaryAtom(nfd)
}

export const createForwardNfdSummaryAtom = (nfd: Nfd) => {
  return atom(async (get) => {
    const nfdResult = await get(getForwardNfdResultAtom(nfd))
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
