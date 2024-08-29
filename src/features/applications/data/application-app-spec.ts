import { ApplicationId } from '@/features/applications/data/types'
import { Atom, atom } from 'jotai'
import { getAppInterfaceAtom } from '@/features/app-interfaces/data'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'

export const createApplicationAppSpecAtom = (applicationId: ApplicationId): Atom<Promise<Arc32AppSpec | undefined>> => {
  return atom(async (get) => {
    const appInterface = await get(getAppInterfaceAtom(applicationId))
    if (!appInterface || appInterface.appSpecVersions.length === 0) return undefined

    const latestAppSpec =
      appInterface.appSpecVersions.find((appSpec) => appSpec.roundLastValid === undefined) ??
      appInterface.appSpecVersions.sort((a, b) => b.roundLastValid! - a.roundLastValid!)[0]

    return latestAppSpec.appSpec
  })
}
