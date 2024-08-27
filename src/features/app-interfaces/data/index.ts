import { ApplicationId } from '@/features/applications/data/types'
import { AppInterfaceEntity, DbConnection, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { invariant } from '@/utils/invariant'
import { createTimestamp, writableAtomCache } from '@/features/common/data'
import { atom, Getter, Setter, useAtomValue, useSetAtom } from 'jotai'
import { atomWithDefault, atomWithRefresh, loadable, useAtomCallback } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'

const getAppInterface = async (dbConnection: DbConnection, applicationId: ApplicationId) => {
  return await dbConnection.get('app-interfaces', applicationId)
}
const writeAppInterface = async (dbConnection: DbConnection, appInterface: AppInterfaceEntity) => {
  await dbConnection.put('app-interfaces', appInterface)
}
const getAppInterfaces = async (dbConnection: DbConnection) => {
  return await dbConnection.getAll('app-interfaces')
}
const deleteAppInterface = async (dbConnection: DbConnection, applicationId: ApplicationId) => {
  await dbConnection.delete('app-interfaces', applicationId)
}

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

export const useCreateAppInterface = () => {
  return useAtomCallback(
    useCallback(
      async (
        get,
        set,
        {
          applicationId,
          name,
          standard,
          roundFirstValid,
          roundLastValid,
          appSpec,
        }: {
          applicationId: ApplicationId
          name: string
          standard: 'ARC-32'
          appSpec: Arc32AppSpec
          roundFirstValid?: number
          roundLastValid?: number
        }
      ) => {
        invariant(roundFirstValid === undefined || roundFirstValid >= 0, 'roundFirstValid must be greater than or equal to 0')
        invariant(roundLastValid === undefined || roundLastValid >= 0, 'roundLastValid must be greater than or equal to 0')
        if (roundFirstValid !== undefined && roundLastValid !== undefined) {
          invariant(roundLastValid > roundFirstValid, 'roundFirstValid must be greater than roundLastValid')
        }

        const dbConnection = await get(dbConnectionAtom)
        const existingAppInterfaces = await getAppInterfaces(dbConnection)
        invariant(
          existingAppInterfaces.find((e) => e.applicationId === applicationId) === undefined,
          `Application ID "${applicationId}" is already associated with another app interface`
        )
        invariant(
          existingAppInterfaces.find((e) => e.name.toLowerCase() === name.toLowerCase()) === undefined,
          `App interface "${name}" already exists, please choose a different name`
        )

        await set(getAppInterfaceAtom(applicationId), {
          applicationId: applicationId,
          name: name,
          appSpecVersions: [
            {
              standard,
              roundFirstValid,
              roundLastValid,
              appSpec,
            },
          ],
          lastModified: createTimestamp(),
        })
      },
      []
    )
  )
}

export const useDeleteAppInterface = (applicationId: ApplicationId) => {
  return useAtomCallback(
    useCallback(
      async (get) => {
        const dbConnection = await get(dbConnectionAtom)
        await deleteAppInterface(dbConnection, applicationId)
      },
      [applicationId]
    )
  )
}

export const useAppInterfaces = () => {
  const appInterfacesAtom = useMemo(() => {
    return atomWithRefresh(async (get) => {
      const dbConnection = await get(dbConnectionAtom)

      const entities = await getAppInterfaces(dbConnection)
      return entities.sort((a, b) => b.lastModified - a.lastModified)
    })
  }, [])
  return [useAtomValue(loadable(appInterfacesAtom)), useSetAtom(appInterfacesAtom)] as const
}
