import { DbConnection, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { ApplicationId } from '@/features/applications/data/types'
import { useMemo } from 'react'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { invariant } from '@/utils/invariant'
import { appInterfaceNotFoundMessage } from '../pages/labels'

export const getAppInterface = async (dbConnection: DbConnection, applicationId: ApplicationId) => {
  const entity = await dbConnection.get('app-interfaces', applicationId.toString())
  if (!entity) {
    return undefined
  }
  return {
    ...entity,
    applicationId: BigInt(entity.applicationId),
  }
}
export const getAppInterfaces = async (dbConnection: DbConnection) => {
  const entities = await dbConnection.getAll('app-interfaces')
  return entities.map((entity) => ({
    ...entity,
    applicationId: BigInt(entity.applicationId),
  }))
}

export const createAppInterfaceAtom = (applicationId: ApplicationId) => {
  return atom(async (get) => {
    const dbConnection = await get(dbConnectionAtom)
    return await getAppInterface(dbConnection, applicationId)
  })
}

export const useAppInterfaces = () => {
  const appInterfacesAtom = useMemo(() => {
    return atomWithRefresh(async (get) => {
      const dbConnection = await get(dbConnectionAtom)

      const entities = await getAppInterfaces(dbConnection)
      return entities.sort((a, b) => b.lastModified - a.lastModified)
    })
  }, [])
  return [useAtomValue(loadable(appInterfacesAtom)), useSetAtom(appInterfacesAtom)] as const
}

export const useAppInterface = (applicationId: ApplicationId) => {
  const appInterfaceAtom = useMemo(() => {
    return atomWithRefresh(async (get) => {
      const dbConnection = await get(dbConnectionAtom)

      const entity = await getAppInterface(dbConnection, applicationId)
      invariant(entity, appInterfaceNotFoundMessage)
      return entity
    })
  }, [applicationId])
  return [useAtomValue(loadable(appInterfaceAtom)), useSetAtom(appInterfaceAtom)] as const
}
