import { DbConnection, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { ApplicationId } from '@/features/applications/data/types'
import { useMemo } from 'react'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { useAtomValue, useSetAtom } from 'jotai/index'

export const getAppInterface = async (dbConnection: DbConnection, applicationId: ApplicationId) => {
  return await dbConnection.get('app-interfaces', applicationId)
}
export const getAppInterfaces = async (dbConnection: DbConnection) => {
  return await dbConnection.getAll('app-interfaces')
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
