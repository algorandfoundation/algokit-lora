import { dbConnectionAtom } from '@/features/common/data/indexed-db'
import { ApplicationId } from '@/features/applications/data/types'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { upsertAppInterface } from './create'
import { AppSpecVersion } from './types'
import { invariant } from '@/utils/invariant'
import { getAppInterfaces } from './read'
import { createTimestamp } from '@/features/common/data'

export const useAddAppSpecVersion = () => {
  return useAtomCallback(
    useCallback(async (get, _, applicationId: ApplicationId, appSpecVersion: AppSpecVersion) => {
      invariant(
        appSpecVersion.roundFirstValid === undefined || appSpecVersion.roundFirstValid >= 0,
        'Round first valid must be greater than or equal to 0'
      )
      invariant(
        appSpecVersion.roundLastValid === undefined || appSpecVersion.roundLastValid >= 0,
        'Round first valid must be greater than or equal to 0'
      )
      if (appSpecVersion.roundFirstValid !== undefined && appSpecVersion.roundLastValid !== undefined) {
        invariant(
          appSpecVersion.roundLastValid >= appSpecVersion.roundFirstValid,
          'Round first valid must be greater than or equal to round last valid'
        )
      }

      const dbConnection = await get(dbConnectionAtom)
      const existingAppInterfaces = await getAppInterfaces(dbConnection)
      const existingAppInterface = existingAppInterfaces.find((e) => e.applicationId === applicationId)

      invariant(existingAppInterface, `Application ID '${applicationId}' does not have an app interface`)

      await upsertAppInterface(dbConnection, {
        ...existingAppInterface,
        appSpecVersions: [...existingAppInterface.appSpecVersions, appSpecVersion],
        lastModified: createTimestamp(),
      })
    }, [])
  )
}

export const useUpdateAppSpecVersion = () => {
  return useAtomCallback(
    useCallback(async (get, _, applicationId: ApplicationId, appSpecVersionIndex: number, appSpecVersion: AppSpecVersion) => {
      invariant(
        appSpecVersion.roundFirstValid === undefined || appSpecVersion.roundFirstValid >= 0,
        'Round first valid must be greater than or equal to 0'
      )
      invariant(
        appSpecVersion.roundLastValid === undefined || appSpecVersion.roundLastValid >= 0,
        'Round first valid must be greater than or equal to 0'
      )
      if (appSpecVersion.roundFirstValid !== undefined && appSpecVersion.roundLastValid !== undefined) {
        invariant(
          appSpecVersion.roundLastValid >= appSpecVersion.roundFirstValid,
          'Round first valid must be greater than or equal to round last valid'
        )
      }

      const dbConnection = await get(dbConnectionAtom)
      const existingAppInterfaces = await getAppInterfaces(dbConnection)
      const existingAppInterface = existingAppInterfaces.find((e) => e.applicationId === applicationId)

      invariant(existingAppInterface, `Application ID '${applicationId}' does not have an app interface`)

      existingAppInterface.appSpecVersions[appSpecVersionIndex] = appSpecVersion

      await upsertAppInterface(dbConnection, {
        ...existingAppInterface,
        lastModified: createTimestamp(),
      })
    }, [])
  )
}

export const useDeleteAppSpec = () => {
  return useAtomCallback(
    useCallback(async (get, _, applicationId: ApplicationId, appSpecVersionIndex: number) => {
      const dbConnection = await get(dbConnectionAtom)
      const existingAppInterfaces = await getAppInterfaces(dbConnection)
      const existingAppInterface = existingAppInterfaces.find((e) => e.applicationId === applicationId)

      invariant(existingAppInterface, `Application ID '${applicationId}' does not have an app interface`)

      existingAppInterface.appSpecVersions.splice(appSpecVersionIndex, 1)

      await upsertAppInterface(dbConnection, {
        ...existingAppInterface,
        lastModified: createTimestamp(),
      })
    }, [])
  )
}
