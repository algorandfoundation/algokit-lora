import { ApplicationId } from '@/features/applications/data/types'
import { ContractEntity, dbConnection } from '@/features/common/data/indexed-db'
import { invariant } from '@/utils/invariant'
import { createTimestamp, writableAtomCache } from '@/features/common/data'
import { atom, Getter, Setter, useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh, loadable, useAtomCallback } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/abi-methods/data/types/arc-32/application'

const getContractEntity = async (applicationId: ApplicationId) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).get('contracts', applicationId)
}
const writeContractEntity = async (contractEntity: ContractEntity) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  await (await dbConnection).put('contracts', contractEntity)
}
const getContractEntities = async () => {
  invariant(dbConnection, 'dbConnection is not initialised')
  return await (await dbConnection).getAll('contracts')
}
const deleteContractEntity = async (applicationId: ApplicationId) => {
  invariant(dbConnection, 'dbConnection is not initialised')
  await (await dbConnection).delete('contracts', applicationId)
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

export const useCreateContractEntity = () => {
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

        const existingContractEntities = await getContractEntities()
        invariant(
          existingContractEntities.find((e) => e.applicationId === applicationId) === undefined,
          `Application Id ${applicationId} is already associated with a contract`
        )

        invariant(
          existingContractEntities.find((e) => e.displayName.toLowerCase() === name.toLowerCase()) === undefined,
          `Contract ${name} already exists`
        )

        const contractEntityAtom = getContractEntityAtom(applicationId)
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
      },
      []
    )
  )
}

export const useDeleteContractEntity = (applicationId: ApplicationId) => {
  return useCallback(async () => {
    await deleteContractEntity(applicationId)
  }, [applicationId])
}

export const useContractEntities = () => {
  const contractEntitiesAtom = useMemo(() => {
    return atomWithRefresh(async () => {
      const entities = await getContractEntities()
      return entities.sort((a, b) => b.lastModified - a.lastModified)
    })
  }, [])
  return [useAtomValue(loadable(contractEntitiesAtom)), useSetAtom(contractEntitiesAtom)] as const
}
