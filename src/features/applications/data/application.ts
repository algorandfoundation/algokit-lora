import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { asApplication } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { ApplicationId } from './types'
import { getApplicationResultAtom } from './application-result'

export const createApplicationAtom = (store: JotaiStore, applicationId: ApplicationId) => {
  return atom(async (get) => {
    const applicationResult = await get(getApplicationResultAtom(store, applicationId))
    return asApplication(applicationResult)
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
