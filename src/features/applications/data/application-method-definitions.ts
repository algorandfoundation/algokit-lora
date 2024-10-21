import { atom, useAtomValue } from 'jotai'
import { asApplicationAbiMethods } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { Application } from '../models'
import { createAppInterfaceAtom } from '@/features/app-interfaces/data'
import { ApplicationId } from './types'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'

const createApplicationMethodDefinitionsAtom = (applicationId: ApplicationId) => {
  return atom(async (get) => {
    const appInterface = await get(createAppInterfaceAtom(applicationId))

    if (!appInterface) {
      return undefined
    }

    const latestVersion =
      appInterface.appSpecVersions.find((appSpec) => appSpec.roundLastValid === undefined) ??
      appInterface.appSpecVersions.sort((a, b) => b.roundLastValid! - a.roundLastValid!)[0]

    return asApplicationAbiMethods(latestVersion.appSpec)
  })
}

export const useLoadableApplicationAbiMethodDefinitions = (application: Application) => {
  const applicationMethodDefinitionsAtom = useMemo(() => {
    return createApplicationMethodDefinitionsAtom(application.id)
  }, [application.id])
  return useAtomValue(loadable(applicationMethodDefinitionsAtom))
}

export const useLoadableAbiMethodDefinitions = (appSpec?: Arc32AppSpec, applicationId?: ApplicationId) => {
  const applicationMethodDefinitionsAtom = useMemo(() => {
    if (appSpec) {
      return atom(() => Promise.resolve(asApplicationAbiMethods(appSpec)))
    } else if (applicationId) {
      return createApplicationMethodDefinitionsAtom(applicationId)
    }

    return atom(() => Promise.resolve(undefined))
  }, [appSpec, applicationId])
  return useAtomValue(loadable(applicationMethodDefinitionsAtom))
}
