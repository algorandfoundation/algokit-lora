import { ApplicationId } from '@/features/applications/data/types'
import { jsonAsArc32AppSpec } from '@/features/abi-methods/mappers'
import { useCallback } from 'react'
import { useAtomCallback } from 'jotai/utils'
import { dbConnection } from '@/features/common/data/indexed-db'
import { AppSpecVersion } from '@/features/abi-methods/data/types'
import { invariant } from '@/utils/invariant'
import { writableAtomCache } from '@/features/common/data'
import { atom } from 'jotai'

const getAppSpecs = async (applicationId: ApplicationId) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return (await (await dbConnection).get('applications-app-specs', applicationId.toString())) ?? []
}
const writeAppSpecs = async (applicationId: ApplicationId, appSpecs: AppSpecVersion[]) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  if (!appSpecs) return

  await (await dbConnection).put('applications-app-specs', appSpecs, applicationId.toString())
}

const writableAppSpecVersionsAtom = (applicationId: ApplicationId) => {
  const appSpecVersions = atom<AppSpecVersion[]>([])

  return atom(
    (get) => {
      const value = get(appSpecVersions)
      if (!value.length) {
        return getAppSpecs(applicationId)
      }
      return value
    },
    async (_, set, appSpecs: AppSpecVersion[]) => {
      await writeAppSpecs(applicationId, appSpecs)
      set(appSpecVersions, appSpecs)
    }
  )
}

export const [applicationsAppSpecsAtom, getApplicationAppSpecsAtom] = writableAtomCache(
  (applicationId: ApplicationId) => writableAppSpecVersionsAtom(applicationId),
  (applicationId: ApplicationId) => applicationId
)

export const useSetAppSpec = (applicationId: ApplicationId) => {
  return useAtomCallback(
    useCallback(
      async (
        get,
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
        const existing = await get(getApplicationAppSpecsAtom(applicationId))
        const applicationAppSpec: AppSpecVersion = { standard, roundFirstValid: roundFirstValid, roundLastValid: roundLastValid, appSpec }

        // If there is an existing app spec with the same standard and valid rounds, remove it and add the new one
        const matchingAppSpecVersion = existing.find(
          (e) => e.standard === standard && e.roundFirstValid === roundFirstValid && e.roundFirstValid === roundFirstValid
        )
        if (matchingAppSpecVersion) {
          const newSpecs = [...existing.filter((e) => e !== matchingAppSpecVersion), applicationAppSpec]
          await set(getApplicationAppSpecsAtom(applicationId), newSpecs)
        } else {
          // Check if there is an existing app spec with the same standard and valid rounds that overlaps with the new one
          const overlappingWithExistingData = existing.some(
            (e) =>
              e.standard === standard &&
              (isInRange(roundFirstValid, e.roundFirstValid, e.roundLastValid) ||
                isInRange(roundLastValid, e.roundFirstValid, e.roundLastValid))
          )
          invariant(!overlappingWithExistingData, 'The supplied app spec valid rounds overlap with existing data')

          const newSpecs = [...existing, applicationAppSpec]
          await set(getApplicationAppSpecsAtom(applicationId), newSpecs)
        }
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
