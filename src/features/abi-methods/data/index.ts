import { ApplicationId } from '@/features/applications/data/types'
import { ApplicationEntity, dbConnection } from '@/features/common/data/indexed-db'
import { invariant } from '@/utils/invariant'
import { writableAtomCache } from '@/features/common/data'
import { atom, Getter, Setter } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/abi-methods/data/types/arc-32/application'
import { AppSpecVersion } from '@/features/abi-methods/data/types'

const getApplicationEntity = async (applicationId: ApplicationId) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).get('applications', applicationId.toString())
}
const writeApplicationEntity = async (applicationEntity: ApplicationEntity) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  await (await dbConnection).put('applications', applicationEntity)
}
const getApplicationEntities = async () => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).getAll('applications')
}

const createWritableApplicationEntitiesAtom = (_: Getter, __: Setter, applicationId: ApplicationId) => {
  const applicationEntityAtom = atom<ApplicationEntity | undefined | Promise<ApplicationEntity | undefined>>(
    getApplicationEntity(applicationId)
  )

  return atom(
    (get) => get(applicationEntityAtom),
    async (_, set, applicationEntity: ApplicationEntity) => {
      await writeApplicationEntity(applicationEntity)
      set(applicationEntityAtom, applicationEntity)
    }
  )
}

export const [applicationEntitiesAtom, getApplicationEntityAtom] = writableAtomCache(
  createWritableApplicationEntitiesAtom,
  (applicationId: ApplicationId) => applicationId
)

export const useSetContractEntity = () => {
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

        const existingContractEntities = await getApplicationEntities()
        invariant(
          existingContractEntities.find((e) => e.displayName.toLowerCase() === name.toLowerCase() && e.id !== applicationId) === undefined,
          'A contract with the same name already exists'
        )

        const entity = await get(getApplicationEntityAtom(applicationId))
        if (!entity) {
          await set(getApplicationEntityAtom(applicationId), {
            id: applicationId,
            displayName: name,
            appSpecVersions: [
              {
                standard,
                roundFirstValid,
                roundLastValid,
                appSpec,
              },
            ],
          })
        } else {
          const existingAppSpecVersions = entity.appSpecVersions
          const applicationAppSpec: AppSpecVersion = {
            standard,
            roundFirstValid: roundFirstValid,
            roundLastValid: roundLastValid,
            appSpec,
          }

          // If there is an existing app spec with the same standard and valid rounds, remove it and add the new one
          const matchingAppSpecVersion = existingAppSpecVersions.find(
            (e) => e.standard === standard && e.roundFirstValid === roundFirstValid && e.roundFirstValid === roundFirstValid
          )
          if (matchingAppSpecVersion) {
            const newSpecs = [...existingAppSpecVersions.filter((e) => e !== matchingAppSpecVersion), applicationAppSpec]
            await set(getApplicationEntityAtom(applicationId), {
              ...entity,
              appSpecVersions: newSpecs,
            })
          } else {
            // Check if there is an existing app spec with the same standard and valid rounds that overlaps with the new one
            const overlappingWithExistingData = existingAppSpecVersions.some(
              (e) =>
                e.standard === standard &&
                (isInRange(roundFirstValid, e.roundFirstValid, e.roundLastValid) ||
                  isInRange(roundLastValid, e.roundFirstValid, e.roundLastValid))
            )
            invariant(!overlappingWithExistingData, 'The supplied app spec valid rounds overlap with existing data')

            const newSpecs = [...existingAppSpecVersions, applicationAppSpec]
            await set(getApplicationEntityAtom(applicationId), {
              ...entity,
              appSpecVersions: newSpecs,
            })
          }
        }
      },
      []
    )
  )
}

const isInRange = (value: number | undefined, start: number | undefined, end: number | undefined) => {
  const a = value ?? -1
  const b = start ?? -1
  const c = end ?? Number.MAX_SAFE_INTEGER
  return a >= b && a <= c
}
