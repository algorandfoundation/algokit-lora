import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { asApplication } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { ApplicationId } from './types'
import { getApplicationResultAtom } from './application-result'
import { getApplicationMetadataResultAtom } from './application-metadata'

export const createApplicationAtom = (store: JotaiStore, applicationId: ApplicationId) => {
  return atom(async (get) => {
    const applicationResult = await get(getApplicationResultAtom(store, applicationId))
    const applicationMetadata = await get(getApplicationMetadataResultAtom(store, applicationResult))
    return asApplication(applicationResult, applicationMetadata)
  })
}

const useApplicationAtom = (applicationId: ApplicationId) => {
  const store = useStore()

  return useMemo(() => {
    return createApplicationAtom(store, applicationId)
  }, [store, applicationId])
}

export const useLoadableApplication = (applicationId: ApplicationId) => {
  return useAtomValue(loadable(useApplicationAtom(applicationId)))
}
