import { DBSchema, IDBPDatabase, IDBPTransaction, openDB, StoreNames } from 'idb'
import { AppSpecVersion } from '@/features/abi-methods/data/types'
import { ApplicationId } from '@/features/applications/data/types'

interface LoraDBSchemaV1 extends DBSchema {
  'applications-app-specs': {
    key: string
    value: AppSpecVersion[]
  }
}

export type ApplicationEntity = {
  id: ApplicationId
  displayName: string
  appSpecVersions: AppSpecVersion[]
  // TODO: uploaded at
}

interface LoraDBSchemaV2 extends DBSchema {
  // TODO: rename to contracts
  applications: {
    key: string
    value: ApplicationEntity
  }
}

export async function getDbConnection(networkId: string) {
  return await openDB<LoraDBSchemaV2>(networkId, 2, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      // Casting to DBSchema to trick TypeScript
      const anyDb = db as unknown as IDBPDatabase<DBSchema>
      const anyTransaction = transaction as unknown as IDBPTransaction<DBSchema, StoreNames<DBSchema>[], 'versionchange'>
      try {
        const migrationsToRun = dbMigrations.slice(oldVersion, newVersion ?? undefined)
        for (const migration of migrationsToRun) {
          await migration(anyDb, anyTransaction)
        }
      } catch (e) {
        // Need to abort the transaction here, so that the database version doesn't get updated to the new version
        transaction.abort()
      }
    },
  })
}

export let dbConnection: Promise<IDBPDatabase<LoraDBSchemaV2>> | undefined = undefined

export const updateDbConnection = (networkId: string) => {
  dbConnection = getDbConnection(networkId)
}

const dbMigrations = [
  async (db: IDBPDatabase<DBSchema>) => {
    const v1Db = db as unknown as IDBPDatabase<LoraDBSchemaV1>
    v1Db.createObjectStore('applications-app-specs')
  },
  async (db: IDBPDatabase<DBSchema>, transaction: IDBPTransaction<DBSchema, StoreNames<DBSchema>[], 'versionchange'>) => {
    const v1Db = db as unknown as IDBPDatabase<LoraDBSchemaV1>
    const v1Transaction = transaction as unknown as IDBPTransaction<LoraDBSchemaV1, StoreNames<LoraDBSchemaV1>[], 'versionchange'>
    const v1Store = v1Transaction.objectStore('applications-app-specs')

    const newItems: ApplicationEntity[] = []
    const keys = await v1Store.getAllKeys()
    for (const key of keys) {
      const item = await v1Store.get(key)
      if (item) {
        newItems.push({
          id: Number(key),
          displayName: '',
          appSpecVersions: [...item],
        })
      }
    }

    v1Db.deleteObjectStore('applications-app-specs')

    const v2Db = db as unknown as IDBPDatabase<LoraDBSchemaV2>
    v2Db.createObjectStore('applications', {
      keyPath: 'id',
    })

    const v2Transaction = transaction as unknown as IDBPTransaction<LoraDBSchemaV2, StoreNames<LoraDBSchemaV2>[], 'versionchange'>
    const v2Store = v2Transaction.objectStore('applications')

    for (const newItem of newItems) {
      await v2Store.put(newItem)
    }
  },
]
