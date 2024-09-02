import { ApplicationId } from '@/features/applications/data/types'
import { writableAtomCache } from '@/features/common/data'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { Getter, Setter, atom } from 'jotai'
import { atomWithDefault } from 'jotai/utils'
import { getAppInterface } from './read'
import { writeAppInterface } from './write'

const createWritableAppInterfaceEntityAtom = (_: Getter, __: Setter, applicationId: ApplicationId) => {
  const appInterfaceAtom = atomWithDefault<AppInterfaceEntity | undefined | Promise<AppInterfaceEntity | undefined>>(async (get) => {
    const dbConnection = await get(dbConnectionAtom)
    return await getAppInterface(dbConnection, applicationId)
  })

  return atom(
    (get) => get(appInterfaceAtom),
    async (get, set, appInterface: AppInterfaceEntity) => {
      const dbConnection = await get(dbConnectionAtom)

      await writeAppInterface(dbConnection, appInterface)
      set(appInterfaceAtom, appInterface)
    }
  )
}

export const [appInterfacesAtom, getAppInterfaceAtom] = writableAtomCache(
  createWritableAppInterfaceEntityAtom,
  (applicationId: ApplicationId) => applicationId
)

export * from './read'
export * from './delete'
export * from './write'
