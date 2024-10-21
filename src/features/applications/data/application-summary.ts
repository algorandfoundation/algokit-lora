import { ApplicationId } from './types'
import { atom, useAtomValue } from 'jotai'
import { getApplicationResultAtom } from './application-result'
import { asApplicationSummary } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'

export const createApplicationSummaryAtom = (applicationId: ApplicationId) => {
  return atom(async (get) => {
    const applicationResult = await get(getApplicationResultAtom(applicationId))
    return asApplicationSummary(applicationResult)
  })
}

const useApplicationSummaryAtom = (applicationId: ApplicationId) => {
  return useMemo(() => {
    return createApplicationSummaryAtom(applicationId)
  }, [applicationId])
}

export const useLoadableApplicationSummaryAtom = (applicationId: ApplicationId) => {
  const assetSummaryAtom = useApplicationSummaryAtom(applicationId)
  return useAtomValue(loadable(assetSummaryAtom))
}
