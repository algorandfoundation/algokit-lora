import { DBSchema, IDBPDatabase, IDBPTransaction, openDB, StoreNames } from 'idb'
import { genesisHashAtom } from '@/features/blocks/data'
import { atom } from 'jotai/index'
import { selectedNetworkAtomId } from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'
import { AppSpecStandard, AppSpecVersion } from '@/features/app-interfaces/data/types'
import { ApplicationId } from '@/features/applications/data/types'

interface LoraDBSchemaV1 extends DBSchema {
  'applications-app-specs': {
    key: string
    value: AppSpecVersion[]
  }
}

export type AppInterfaceEntityV2 = {
  applicationId: ApplicationId
  name: string
  appSpecVersions: AppSpecVersion[]
  lastModified: number
}

export type AppInterfaceEntityV3 = {
  applicationId: string
  name: string
  appSpecVersions: AppSpecVersion[]
  lastModified: number
}

export type AppInterfaceEntity = {
  applicationId: ApplicationId
  name: string
  appSpecVersions: AppSpecVersion[]
  lastModified: number
}

interface LoraDBSchemaV2 extends DBSchema {
  'app-interfaces': {
    key: number
    value: AppInterfaceEntityV2
  }
}

interface LoraDBSchemaV3 extends DBSchema {
  'app-interfaces': {
    key: string
    value: AppInterfaceEntityV3
  }
}

export const dbConnectionAtom = atom(async (get) => {
  const networkId = settingsStore.get(selectedNetworkAtomId)
  const genesisHash = await get(genesisHashAtom)

  return await openDB<LoraDBSchemaV3>(`${networkId}-${genesisHash}`, 3, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      // Casting to DBSchema to trick TypeScript
      const anyDb = db as unknown as IDBPDatabase<DBSchema>
      const anyTransaction = transaction as unknown as IDBPTransaction<DBSchema, StoreNames<DBSchema>[], 'versionchange'>
      try {
        const migrationsToRun = dbMigrations.slice(oldVersion, newVersion ?? undefined)
        for (const migration of migrationsToRun) {
          await migration(anyDb, anyTransaction)
        }
      } catch {
        // Need to abort the transaction here, so that the database version doesn't get updated to the new version
        transaction.abort()
      }
    },
  })
})

const dbMigrations = [
  async (db: IDBPDatabase<DBSchema>) => {
    const v1Db = db as unknown as IDBPDatabase<LoraDBSchemaV1>
    v1Db.createObjectStore('applications-app-specs')
  },
  async (db: IDBPDatabase<DBSchema>, transaction: IDBPTransaction<DBSchema, StoreNames<DBSchema>[], 'versionchange'>) => {
    const v1Db = db as unknown as IDBPDatabase<LoraDBSchemaV1>
    const v1Transaction = transaction as unknown as IDBPTransaction<LoraDBSchemaV1, StoreNames<LoraDBSchemaV1>[], 'versionchange'>
    const v1Store = v1Transaction.objectStore('applications-app-specs')

    const newItems: AppInterfaceEntityV2[] = []
    const keys = await v1Store.getAllKeys()
    for (const key of keys) {
      const item = await v1Store.get(key)
      if (item && item.length > 0) {
        if (item[0].standard === AppSpecStandard.ARC32) {
          newItems.push({
            applicationId: BigInt(key),
            name: item[0].appSpec.contract.name,
            appSpecVersions: [...item],
            lastModified: Date.now(),
          })
        } else if (item[0].standard === AppSpecStandard.ARC4) {
          newItems.push({
            applicationId: BigInt(key),
            name: item[0].appSpec.name,
            appSpecVersions: [...item],
            lastModified: Date.now(),
          })
        }
      }
    }

    v1Db.deleteObjectStore('applications-app-specs')

    const v2Db = db as unknown as IDBPDatabase<LoraDBSchemaV2>
    v2Db.createObjectStore('app-interfaces', {
      keyPath: 'applicationId',
    })

    const v2Transaction = transaction as unknown as IDBPTransaction<LoraDBSchemaV2, StoreNames<LoraDBSchemaV2>[], 'versionchange'>
    const v2Store = v2Transaction.objectStore('app-interfaces')

    for (const newItem of newItems) {
      await v2Store.put(newItem)
    }
  },
  async (db: IDBPDatabase<DBSchema>, transaction: IDBPTransaction<DBSchema, StoreNames<DBSchema>[], 'versionchange'>) => {
    const v2Db = db as unknown as IDBPDatabase<LoraDBSchemaV2>
    const v2Transaction = transaction as unknown as IDBPTransaction<LoraDBSchemaV2, StoreNames<LoraDBSchemaV2>[], 'versionchange'>
    const v2Store = v2Transaction.objectStore('app-interfaces')

    const newItems = (await v2Store.getAll()).map((item) => ({
      ...item,
      appSpecVersions: item.appSpecVersions.map((appSpecVersion) => ({
        ...appSpecVersion,
        roundFirstValid: appSpecVersion.roundFirstValid !== undefined ? BigInt(appSpecVersion.roundFirstValid) : undefined,
        roundLastValid: appSpecVersion.roundLastValid !== undefined ? BigInt(appSpecVersion.roundLastValid) : undefined,
      })),
      applicationId: item.applicationId.toString(),
    }))
    v2Db.deleteObjectStore('app-interfaces')

    const v3Db = db as unknown as IDBPDatabase<LoraDBSchemaV3>
    v3Db.createObjectStore('app-interfaces', {
      keyPath: 'applicationId',
    })

    const v3Transaction = transaction as unknown as IDBPTransaction<LoraDBSchemaV3, StoreNames<LoraDBSchemaV3>[], 'versionchange'>
    const v3Store = v3Transaction.objectStore('app-interfaces')

    for (const newItem of newItems) {
      await v3Store.put(newItem)
    }
  },
]

export type DbConnection = IDBPDatabase<LoraDBSchemaV3>
