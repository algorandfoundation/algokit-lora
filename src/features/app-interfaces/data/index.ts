import { ApplicationId } from '@/features/applications/data/types'
import { AppInterfaceEntity, dbConnection } from '@/features/common/data/indexed-db'
import { invariant } from '@/utils/invariant'
import { createTimestamp, writableAtomCache } from '@/features/common/data'
import { atom, Getter, Setter } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'

const getAppInterface = async (applicationId: ApplicationId) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).get('appInterfaces', applicationId)
}
const writeAppInterface = async (contractEntity: AppInterfaceEntity) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  await (await dbConnection).put('appInterfaces', contractEntity)
}
const getAppInterfaces = async () => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).getAll('appInterfaces')
}

const createWritableAppInterfaceEntityAtom = (_: Getter, __: Setter, applicationId: ApplicationId) => {
  const appInterfaceAtom = atom<AppInterfaceEntity | undefined | Promise<AppInterfaceEntity | undefined>>(getAppInterface(applicationId))

  return atom(
    (get) => get(appInterfaceAtom),
    async (_, set, appInterface: AppInterfaceEntity) => {
      await writeAppInterface(appInterface)
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
        _,
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

        const existingAppInterfaces = await getAppInterfaces()
        invariant(
          existingAppInterfaces.find((e) => e.applicationId === applicationId) === undefined,
          `Application Id ${applicationId} is already associated with another app interface`
        )
        invariant(
          existingAppInterfaces.find((e) => e.displayName.toLowerCase() === name.toLowerCase()) === undefined,
          `App interface named ${name} already exists`
        )

        await set(getAppInterfaceAtom(applicationId), {
          applicationId: applicationId,
          displayName: name,
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
