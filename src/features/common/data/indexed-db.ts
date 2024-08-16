import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { AppSpecVersion } from '@/features/abi-methods/data/types'

interface LoraDBSchema extends DBSchema {
  'applications-app-specs': {
    key: string
    value: AppSpecVersion[]
  }
}

export async function getDbConnection(networkId: string) {
  return await openDB<LoraDBSchema>(networkId, 1, {
    upgrade(db, oldVersion, newVersion) {
      const migrationsToRun = dbMigrations.slice(oldVersion, newVersion ?? undefined)
      migrationsToRun.forEach((migration) => {
        migration(db)
      })
    },
  })
}

export let dbConnection: Promise<IDBPDatabase<LoraDBSchema>> | undefined = undefined

export const updateDbConnection = (networkId: string) => {
  dbConnection = getDbConnection(networkId)
}

const dbMigrations = [
  (db: IDBPDatabase<LoraDBSchema>) => {
    db.createObjectStore('applications-app-specs')
  },
]
