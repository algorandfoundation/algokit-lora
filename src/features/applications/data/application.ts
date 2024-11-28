import { atom, useAtomValue, useSetAtom } from 'jotai'
import { asApplication, asArc56AppSpec } from '../mappers'
import { useMemo } from 'react'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { ApplicationId } from './types'
import { applicationResultsAtom, getApplicationResultAtom } from './application-result'
import { getApplicationMetadataResultAtom } from './application-metadata'
import { atomEffect } from 'jotai-effect'
import { createAppSpecAtom } from './application-method-definitions'

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
      const appSpec = await get(createAppSpecAtom(applicationId))
      get(detectIsStaleEffect)
      return asApplication(applicationResult, applicationMetadata, appSpec ? asArc56AppSpec(appSpec) : undefined)
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
