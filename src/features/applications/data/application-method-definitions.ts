import { atom, useAtomValue } from 'jotai'
import { asMethodDefinitions } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { createAppInterfaceAtom } from '@/features/app-interfaces/data'
import { ApplicationId } from './types'
import { getLatestAppSpecVersion } from '@/features/app-interfaces/mappers'

export const createAppSpecAtom = (applicationId: ApplicationId) => {
  return atom(async (get) => {
    const appInterface = await get(createAppInterfaceAtom(applicationId))

    if (!appInterface) {
      return undefined
    }

    const latestVersion = getLatestAppSpecVersion(appInterface.appSpecVersions)

    if (!latestVersion) {
      return undefined
    }

    return latestVersion.appSpec
  })
}

const createMethodDefinitionsAtom = (applicationId: ApplicationId) => {
  return atom(async (get) => {
    const appSpec = await get(createAppSpecAtom(applicationId))
    return appSpec ? asMethodDefinitions(appSpec) : []
  })
}

export const useLoadableMethodDefinitions = (applicationId: ApplicationId) => {
  const applicationMethodDefinitionsAtom = useMemo(() => {
    return createMethodDefinitionsAtom(applicationId)
  }, [applicationId])
  return useAtomValue(loadable(applicationMethodDefinitionsAtom))
}
