import { JotaiStore } from '@/features/common/data/types'
import { ApplicationId } from './types'
import { atom } from 'jotai'
import { getApplicationResultAtom } from './application-result'
import { asApplicationSummary } from '../mappers'

export const createApplicationSummaryAtom = (store: JotaiStore, applicationId: ApplicationId) => {
  return atom(async (get) => {
    const applicationResult = await get(getApplicationResultAtom(store, applicationId))
    return asApplicationSummary(applicationResult)
  })
}
