import { ApplicationId } from '@/features/applications/data/types'
import { ContractEntity, dbConnection } from '@/features/common/data/indexed-db'
import { invariant } from '@/utils/invariant'
import { createTimestamp, writableAtomCache } from '@/features/common/data'
import { atom, Getter, Setter } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/abi-methods/data/types/arc-32/application'
import { AppSpecVersion } from '@/features/abi-methods/data/types'

const getContractEntity = async (applicationId: ApplicationId) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).get('contracts', applicationId.toString())
}
const writeContractEntity = async (contractEntity: ContractEntity) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  await (await dbConnection).put('contracts', contractEntity)
}
const getContractEntities = async () => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).getAll('contracts')
}

const createWritableContractEntityAtom = (_: Getter, __: Setter, applicationId: ApplicationId) => {
  const contractEntityAtom = atom<ContractEntity | undefined | Promise<ContractEntity | undefined>>(getContractEntity(applicationId))

  return atom(
    (get) => get(contractEntityAtom),
    async (_, set, contractEntity: ContractEntity) => {
      await writeContractEntity(contractEntity)
      set(contractEntityAtom, contractEntity)
    }
  )
}

export const [contractEntitiesAtom, getContractEntityAtom] = writableAtomCache(
  createWritableContractEntityAtom,
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

        const existingContractEntities = await getContractEntities()
        invariant(
          existingContractEntities.find((e) => e.displayName.toLowerCase() === name.toLowerCase() && e.applicationId !== applicationId) ===
            undefined,
          'A contract with the same name already exists'
        )

        const contractEntityAtom = getContractEntityAtom(applicationId)
        const entity = await get(contractEntityAtom)
        if (!entity) {
          await set(contractEntityAtom, {
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
            await set(contractEntityAtom, {
              ...entity,
              appSpecVersions: newSpecs,
              lastModified: createTimestamp(),
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
            await set(contractEntityAtom, {
              ...entity,
              appSpecVersions: newSpecs,
              lastModified: createTimestamp(),
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
