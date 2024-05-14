import { indexer } from '@/features/common/data'
import { JotaiStore } from '@/features/common/data/types'
import { atom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { ApplicationLookupResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { asApplication } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { ApplicationId } from './types'
import { applicationResultsAtom } from './core'

const fetchApplicationResultAtomBuilder = (applicationId: ApplicationId) => {
  return atom(async (_get) => {
    return await indexer
      .lookupApplications(applicationId)
      .includeAll(true)
      .do()
      .then((result) => {
        return (result as ApplicationLookupResult).application
      })
  })
}

export const getApplicationAtomBuilder = (store: JotaiStore, applicationId: ApplicationId) => {
  const fetchApplicationResultAtom = fetchApplicationResultAtomBuilder(applicationId)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const applicationResult = await get(fetchApplicationResultAtom)
        set(applicationResultsAtom, (prev) => {
          const next = new Map(prev)
          next.set(applicationResult.id, applicationResult)
          return next
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const applicationResults = store.get(applicationResultsAtom)
    const cachedApplicationResult = applicationResults.get(applicationId)
    if (cachedApplicationResult) {
      return asApplication(cachedApplicationResult)
    }

    get(syncEffect)

    const applicationResult = await get(fetchApplicationResultAtom)
    return asApplication(applicationResult)
  })
}

const useApplicationAtom = (applicationId: ApplicationId) => {
  const store = useStore()

  return useMemo(() => {
    return getApplicationAtomBuilder(store, applicationId)
  }, [store, applicationId])
}

export const useLoadableApplication = (applicationId: ApplicationId) => {
  return useAtomValue(loadable(useApplicationAtom(applicationId)))
}
