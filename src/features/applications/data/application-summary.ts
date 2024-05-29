import { ApplicationId } from './types'
import { atom } from 'jotai'
import { getApplicationResultAtom } from './application-result'
import { asApplicationSummary } from '../mappers'

export const createApplicationSummaryAtom = (applicationId: ApplicationId) => {
  return atom(async (get) => {
    const applicationResult = await get(getApplicationResultAtom(applicationId))
    return asApplicationSummary(applicationResult)
  })
}
