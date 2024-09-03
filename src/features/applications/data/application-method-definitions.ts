import { atom, useAtomValue } from 'jotai'
import { asApplicationAbiMethods } from '../mappers'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { Application } from '../models'
import { createAppInterfaceAtom } from '@/features/app-interfaces/data'

const createApplicationMethodDefinitionsAtom = (application: Application) => {
  return atom(async (get) => {
    const appInterface = await get(createAppInterfaceAtom(application.id))

    if (!appInterface) {
      return undefined
    }

    const latestVersion =
      appInterface.appSpecVersions.find((appSpec) => appSpec.roundLastValid === undefined) ??
      appInterface.appSpecVersions.sort((a, b) => b.roundLastValid! - a.roundLastValid!)[0]

    return asApplicationAbiMethods(latestVersion.appSpec)
  })
}

// TODO: NC - Rename all this stuff
export const useLoadableApplicationAbiMethodDefinitions = (application: Application) => {
  const applicationMethodDefinitionsAtom = useMemo(() => {
    return createApplicationMethodDefinitionsAtom(application)
  }, [application])
  return useAtomValue(loadable(applicationMethodDefinitionsAtom))
}
