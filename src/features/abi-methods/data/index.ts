import { ApplicationId } from '@/features/applications/data/types'
import { useSetAtom } from 'jotai'
import { mapJsonToArc32AppSpec } from '@/features/abi-methods/mappers'
import { useCallback } from 'react'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import { dataStore } from '@/features/common/data/data-store'
import { dbAtom } from '@/features/common/data/indexed-db'
import { ApplicationAppSpecs } from '@/features/abi-methods/data/types'

// TODO: review this, maybe use atoms-in-atom
export const applicationsAppSpecsAtom = atomFamily(
  (applicationId: ApplicationId) =>
    atomWithStorage<ApplicationAppSpecs | undefined>(
      applicationId.toString(),
      undefined,
      {
        setItem: async (key, value) => {
          if (!value) return
          const db = await dataStore.get(dbAtom)
          await db.put('applications-app-specs', value, key)
        },
        getItem: async (key: string) => {
          const db = await dataStore.get(dbAtom)
          return await db.get('applications-app-specs', key)
        },
        removeItem: async (key: string) => {
          const db = await dataStore.get(dbAtom)
          await db.delete('applications-app-specs', key)
        },
      },
      { getOnInit: true }
    ),
  (appId1, appId2) => appId1.toString() === appId2.toString()
)

export const useSetAppSpec = (applicationId: ApplicationId) => {
  const setAppSpec = useSetAtom(applicationsAppSpecsAtom(applicationId))

  return useCallback(
    async ({
      standard,
      validFromRound,
      validUntilRound,
      json,
    }: {
      standard: 'ARC-32'
      json: unknown
      validFromRound?: number
      validUntilRound?: number
    }) => {
      const appSpec = mapJsonToArc32AppSpec(json)
      await setAppSpec({
        applicationId: applicationId,
        appSpecVersions: [
          {
            standard: standard,
            validFromRound: validFromRound,
            validUntilRound: validUntilRound,
            appSpec: appSpec,
          },
        ],
      })
    },
    [applicationId, setAppSpec]
  )
}
