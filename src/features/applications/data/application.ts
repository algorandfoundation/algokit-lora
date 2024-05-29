import { atom, useAtomValue } from 'jotai'
import { asApplication } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { ApplicationId } from './types'
import { getApplicationResultAtom } from './application-result'
import { getApplicationMetadataResultAtom } from './application-metadata'

export const createApplicationAtom = (applicationId: ApplicationId) => {
  return atom(async (get) => {
    const applicationResult = await get(getApplicationResultAtom(applicationId))
    const applicationMetadata = await get(getApplicationMetadataResultAtom(applicationResult))
    return asApplication(applicationResult, applicationMetadata)
  })
}

const useApplicationAtom = (applicationId: ApplicationId) => {
  return useMemo(() => {
    return createApplicationAtom(applicationId)
  }, [applicationId])
}

export const useLoadableApplication = (applicationId: ApplicationId) => {
  return useAtomValue(loadable(useApplicationAtom(applicationId)))
}
