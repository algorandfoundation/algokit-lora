import { DbConnection, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { ApplicationId } from '@/features/applications/data/types'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'

const deleteAppInterface = async (dbConnection: DbConnection, applicationId: ApplicationId) => {
  await dbConnection.delete('app-interfaces', applicationId)
}

export const useDeleteAppInterface = (applicationId: ApplicationId) => {
  return useAtomCallback(
    useCallback(
      async (get) => {
        const dbConnection = await get(dbConnectionAtom)
        await deleteAppInterface(dbConnection, applicationId)
      },
      [applicationId]
    )
  )
}
