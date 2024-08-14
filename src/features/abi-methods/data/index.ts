import { ApplicationId } from '@/features/applications/data/types'
import { jsonAsArc32AppSpec } from '@/features/abi-methods/mappers'
import { useCallback } from 'react'
import { atomWithStorage, useAtomCallback } from 'jotai/utils'
import { dbConnection } from '@/features/common/data/indexed-db'
import { AppSpecVersion } from '@/features/abi-methods/data/types'
import { invariant } from '@/utils/invariant'
import { atomsInAtomV2 } from '@/features/common/data'

export const [applicationsAppSpecsAtom, getApplicationAppSpecsAtom] = atomsInAtomV2(
  (applicationId: ApplicationId) =>
    atomWithStorage<AppSpecVersion[]>(
      applicationId.toString(),
      [],
      {
        setItem: async (key, value) => {
          if (!dbConnection) throw new Error('dbConnection is undefined')
          if (!value) return
          await (await dbConnection).put('applications-app-specs', value, key)
        },
        getItem: async (key: string) => {
          if (!dbConnection) throw new Error('dbConnection is undefined')
          const items = await (await dbConnection).get('applications-app-specs', key)
          return items ?? []
        },
        removeItem: async (key: string) => {
          if (!dbConnection) throw new Error('dbConnection is undefined')
          await (await dbConnection).delete('applications-app-specs', key)
        },
      },
      { getOnInit: true }
    ),
  (applicationId) => applicationId
)

export const useSetAppSpec = (applicationId: ApplicationId) => {
  return useAtomCallback(
    useCallback(
      async (
        _,
        set,
        {
          standard,
          roundFirstValid,
          roundLastValid,
          json,
        }: {
          standard: 'ARC-32'
          json: unknown
          roundFirstValid?: number
          roundLastValid?: number
        }
      ) => {
        invariant(roundFirstValid === undefined || roundFirstValid >= 0, 'roundFirstValid must be greater than or equal to 0')
        invariant(roundLastValid === undefined || roundLastValid >= 0, 'roundLastValid must be greater than or equal to 0')
        if (roundFirstValid !== undefined && roundLastValid !== undefined) {
          invariant(roundLastValid > roundFirstValid, 'roundFirstValid must be greater than roundLastValid')
        }

        const appSpec = jsonAsArc32AppSpec(json)
        await set(getApplicationAppSpecsAtom(applicationId), async (prev) => {
          const existing = await prev
          const applicationAppSpec: AppSpecVersion = { standard, roundFirstValid: roundFirstValid, roundLastValid: roundLastValid, appSpec }

          // If there is an existing app spec with the same standard and valid rounds, remove it and add the new one
          const matchingAppSpecVersion = existing.find(
            (e) => e.standard === standard && e.roundFirstValid === roundFirstValid && e.roundFirstValid === roundFirstValid
          )
          if (matchingAppSpecVersion) {
            return [...existing.filter((e) => e !== matchingAppSpecVersion), applicationAppSpec]
          }

          // Check if there is an existing app spec with the same standard and valid rounds that overlaps with the new one
          const overlappingWithExistingData = existing.some(
            (e) =>
              e.standard === standard &&
              (isInRange(roundFirstValid, e.roundFirstValid, e.roundLastValid) ||
                isInRange(roundLastValid, e.roundFirstValid, e.roundLastValid))
          )
          invariant(!overlappingWithExistingData, 'The supplied app spec valid rounds overlap with existing data')

          return [...existing, applicationAppSpec]
        })
      },
      [applicationId]
    )
  )
}

const isInRange = (value: number | undefined, start: number | undefined, end: number | undefined) => {
  const a = value ?? -1
  const b = start ?? -1
  const c = end ?? Number.MAX_SAFE_INTEGER
  return a >= b && a <= c
}
