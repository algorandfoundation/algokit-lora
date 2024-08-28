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

// export type AppSpecDetails = {
//   applicationId: ApplicationId
//   name: string
// } & AppSpecVersion

// export const useCreateAppInterface = () => {
//   return useAtomCallback(
//     useCallback(async (get, set, appSpecDetails: AppSpecDetails) => {
//       const { applicationId, name, ...appSpecVersion } = appSpecDetails
//       invariant(
//         appSpecVersion.roundFirstValid === undefined || appSpecVersion.roundFirstValid >= 0,
//         'roundFirstValid must be greater than or equal to 0'
//       )
//       invariant(
//         appSpecVersion.roundLastValid === undefined || appSpecVersion.roundLastValid >= 0,
//         'roundLastValid must be greater than or equal to 0'
//       )
//       if (appSpecVersion.roundFirstValid !== undefined && appSpecVersion.roundLastValid !== undefined) {
//         invariant(appSpecVersion.roundLastValid > appSpecVersion.roundFirstValid, 'roundFirstValid must be greater than roundLastValid')
//       }

//       const dbConnection = await get(dbConnectionAtom)
//       const existingAppInterfaces = await getAppInterfaces(dbConnection)
//       invariant(
//         existingAppInterfaces.find((e) => e.applicationId === applicationId) === undefined,
//         `Application ID "${applicationId}" is already associated with another app interface`
//       )
//       invariant(
//         existingAppInterfaces.find((e) => e.name.toLowerCase() === name.toLowerCase()) === undefined,
//         `An app interface with the name "${name}" already exists`
//       )

//       await set(getAppInterfaceAtom(applicationId), {
//         applicationId: applicationId,
//         name: name,
//         appSpecVersions: [appSpecDetails],
//         lastModified: createTimestamp(),
//       })
//     }, [])
//   )
// }

// export const useDeleteAppInterface = (applicationId: ApplicationId) => {
//   return useAtomCallback(
//     useCallback(
//       async (get) => {
//         const dbConnection = await get(dbConnectionAtom)
//         await deleteAppInterface(dbConnection, applicationId)
//       },
//       [applicationId]
//     )
//   )
// }

// export const useAppInterfaces = () => {
//   const appInterfacesAtom = useMemo(() => {
//     return atomWithRefresh(async (get) => {
//       const dbConnection = await get(dbConnectionAtom)

//       const entities = await getAppInterfaces(dbConnection)
//       return entities.sort((a, b) => b.lastModified - a.lastModified)
//     })
//   }, [])
//   return [useAtomValue(loadable(appInterfacesAtom)), useSetAtom(appInterfacesAtom)] as const
// }
