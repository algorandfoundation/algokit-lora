import { atom } from 'jotai'
import { getNfdResultAtom } from './nfd-result'
import { Nfd } from './types'
import { asNfdSummary } from '../mappers/nfd-summary'

export const nfdSummaryResolver = (nfd: Nfd) => {
  return createNfdSummaryAtom(nfd)
}

export const createNfdSummaryAtom = (nfd: Nfd) => {
  return atom(async (get) => {
    const nfdResult = await get(getNfdResultAtom(nfd))
    return asNfdSummary(nfdResult)
  })
}
