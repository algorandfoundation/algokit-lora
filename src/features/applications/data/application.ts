import { atom, useAtomValue, useSetAtom } from 'jotai'
import { asApplication } from '../mappers'
import { useMemo } from 'react'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { ApplicationId } from './types'
import { applicationResultsAtom, getApplicationResultAtom } from './application-result'
import { getApplicationMetadataResultAtom } from './application-metadata'
import { atomEffect } from 'jotai-effect'
import { createAppInterfaceAtom } from '@/features/app-interfaces/data'
import { createApplicationMethodDefinitionsAtom } from '@/features/applications/data/application-method-definitions'

const createApplicationAtoms = (applicationId: ApplicationId) => {
  const isStaleAtom = atom(false)
  const detectIsStaleEffect = atomEffect((get, set) => {
    const applicationResults = get(applicationResultsAtom)
    const isStale = applicationResults.get(applicationId) === undefined
    set(isStaleAtom, isStale)
  })

  return [
    atomWithRefresh(async (get) => {
      const applicationResult = await get(getApplicationResultAtom(applicationId))
      const applicationMetadata = await get(getApplicationMetadataResultAtom(applicationResult))
      const appMethodDefinitions = await get(createApplicationMethodDefinitionsAtom(applicationId))

      get(detectIsStaleEffect)
      return asApplication(applicationResult, applicationMetadata, appMethodDefinitions?.appSpec)
    }),
    isStaleAtom,
  ] as const
}

const useApplicationAtoms = (applicationId: ApplicationId) => {
  return useMemo(() => {
    return createApplicationAtoms(applicationId)
  }, [applicationId])
}

export const useLoadableApplication = (applicationId: ApplicationId) => {
  const [applicationAtom, isStaleAtom] = useApplicationAtoms(applicationId)
  return [useAtomValue(loadable(applicationAtom)), useSetAtom(applicationAtom), useAtomValue(isStaleAtom)] as const
}
