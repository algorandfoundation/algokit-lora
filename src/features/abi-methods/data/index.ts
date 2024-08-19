import { ApplicationId } from '@/features/applications/data/types'
import { ApplicationEntity, dbConnection } from '@/features/common/data/indexed-db'
import { invariant } from '@/utils/invariant'
import { writableAtomCache } from '@/features/common/data'
import { atom, Getter, Setter } from 'jotai'

const getApplicationEntity = async (applicationId: ApplicationId) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).get('applications', applicationId.toString())
}
const writeApplicationEntity = async (applicationId: ApplicationId, applicationEntity: ApplicationEntity) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  await (await dbConnection).put('applications', applicationEntity, applicationId.toString())
}

const createWritableApplicationEntitiesAtom = (_: Getter, __: Setter, applicationId: ApplicationId) => {
  // TODO: check name
  const applicationEntityAtom = atom<ApplicationEntity | undefined | Promise<ApplicationEntity | undefined>>(
    getApplicationEntity(applicationId)
  )

  return atom(
    (get) => get(applicationEntityAtom),
    async (_, set, applicationEntity: ApplicationEntity) => {
      await writeApplicationEntity(applicationId, applicationEntity)
      set(applicationEntityAtom, applicationEntity)
    }
  )
}

export const [applicationEntitiesAtom, getApplicationEntityAtom] = writableAtomCache(
  createWritableApplicationEntitiesAtom,
  (applicationId: ApplicationId) => applicationId
)

// export const useSetAppSpec = (applicationId: ApplicationId) => {
//   return useAtomCallback(
//     useCallback(
//       async (
//         get,
//         set,
//         {
//           standard,
//           roundFirstValid,
//           roundLastValid,
//           json,
//         }: {
//           standard: 'ARC-32'
//           json: unknown
//           roundFirstValid?: number
//           roundLastValid?: number
//         }
//       ) => {
//         invariant(roundFirstValid === undefined || roundFirstValid >= 0, 'roundFirstValid must be greater than or equal to 0')
//         invariant(roundLastValid === undefined || roundLastValid >= 0, 'roundLastValid must be greater than or equal to 0')
//         if (roundFirstValid !== undefined && roundLastValid !== undefined) {
//           invariant(roundLastValid > roundFirstValid, 'roundFirstValid must be greater than roundLastValid')
//         }
//
//         const appSpec = jsonAsArc32AppSpec(json)
//         const existing = await get(getApplicationAppSpecsAtom(applicationId))
//         const applicationAppSpec: AppSpecVersion = { standard, roundFirstValid: roundFirstValid, roundLastValid: roundLastValid, appSpec }
//
//         // If there is an existing app spec with the same standard and valid rounds, remove it and add the new one
//         const matchingAppSpecVersion = existing.find(
//           (e) => e.standard === standard && e.roundFirstValid === roundFirstValid && e.roundFirstValid === roundFirstValid
//         )
//         if (matchingAppSpecVersion) {
//           const newSpecs = [...existing.filter((e) => e !== matchingAppSpecVersion), applicationAppSpec]
//           await set(getApplicationAppSpecsAtom(applicationId), newSpecs)
//         } else {
//           // Check if there is an existing app spec with the same standard and valid rounds that overlaps with the new one
//           const overlappingWithExistingData = existing.some(
//             (e) =>
//               e.standard === standard &&
//               (isInRange(roundFirstValid, e.roundFirstValid, e.roundLastValid) ||
//                 isInRange(roundLastValid, e.roundFirstValid, e.roundLastValid))
//           )
//           invariant(!overlappingWithExistingData, 'The supplied app spec valid rounds overlap with existing data')
//
//           const newSpecs = [...existing, applicationAppSpec]
//           await set(getApplicationAppSpecsAtom(applicationId), newSpecs)
//         }
//       },
//       [applicationId]
//     )
//   )
// }
//
// const isInRange = (value: number | undefined, start: number | undefined, end: number | undefined) => {
//   const a = value ?? -1
//   const b = start ?? -1
//   const c = end ?? Number.MAX_SAFE_INTEGER
//   return a >= b && a <= c
// }
