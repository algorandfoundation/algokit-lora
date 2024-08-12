import { ApplicationId } from '@/features/applications/data/types'
import { useSetAtom } from 'jotai'
import { mapJsonToArc32AppSpec } from '@/features/abi-methods/mappers'
import { useCallback } from 'react'
import { atomWithStorage } from 'jotai/utils'
import { dataStore } from '@/features/common/data/data-store'
import { dbAtom } from '@/features/common/data/indexed-db'
import { AppSpecVersion } from '@/features/abi-methods/data/types'
import { invariant } from '@/utils/invariant'
import { atomsInAtomV4 } from '@/features/common/data'

// TODO: review this, maybe use atoms-in-atom
export const [applicationsAppSpecsAtom, getApplicationsAppSpecsAtom] = atomsInAtomV4(
  (applicationId: ApplicationId) =>
    atomWithStorage<AppSpecVersion[]>(
      applicationId.toString(),
      [],
      {
        setItem: async (key, value) => {
          if (!value) return
          const db = await dataStore.get(dbAtom)
          await db.put('applications-app-specs', value, key)
        },
        getItem: async (key: string) => {
          const db = await dataStore.get(dbAtom)
          const items = await db.get('applications-app-specs', key)
          return items ?? []
        },
        removeItem: async (key: string) => {
          const db = await dataStore.get(dbAtom)
          await db.delete('applications-app-specs', key)
        },
      },
      { getOnInit: true }
    ),
  (applicationId) => applicationId
)

export const useSetAppSpec = (applicationId: ApplicationId) => {
  const foo = getApplicationsAppSpecsAtom(applicationId)

  const setAppSpec = useSetAtom(foo)

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
      invariant(validFromRound === undefined || validFromRound >= 0, 'validFromRound must be greater than or equal to 0')
      invariant(validUntilRound === undefined || validUntilRound >= 0, 'validUntilRound must be greater than or equal to 0')
      if (validFromRound !== undefined && validUntilRound !== undefined) {
        invariant(validUntilRound > validFromRound, 'validUntilRound must be greater than validFromRound')
      }

      const appSpec = mapJsonToArc32AppSpec(json)
      await setAppSpec(async (prev) => {
        const existing = await prev
        const applicationAppSpec: AppSpecVersion = { standard, validFromRound, validUntilRound, appSpec }

        // If there is an existing app spec with the same standard and valid rounds, remove it and add the new one
        const matchingAppSpecVersion = existing.find(
          (e) => e.standard === standard && e.validFromRound === validFromRound && e.validFromRound === validFromRound
        )
        if (matchingAppSpecVersion) {
          return [...existing.filter((e) => e !== matchingAppSpecVersion), applicationAppSpec]
        }

        // Check if there is an existing app spec with the same standard and valid rounds that overlaps with the new one
        const overlappingWithExistingData = existing.some(
          (e) =>
            e.standard === standard &&
            (isInRange(validFromRound, e.validFromRound, e.validUntilRound) ||
              isInRange(validUntilRound, e.validFromRound, e.validUntilRound))
        )
        invariant(!overlappingWithExistingData, 'The supplied app spec valid rounds overlap with existing data')

        return [...existing, applicationAppSpec]
      })
    },
    [setAppSpec]
  )
}

const isInRange = (value: number | undefined, start: number | undefined, end: number | undefined) => {
  const a = value ?? -1
  const b = start ?? -1
  const c = end ?? Number.MAX_SAFE_INTEGER
  return a >= b && a <= c
}
