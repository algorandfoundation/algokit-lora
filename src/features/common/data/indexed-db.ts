import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { AppSpecVersion } from '@/features/abi-methods/data/types'
import { atom } from 'jotai'
import { selectedNetworkAtomId } from '@/features/network/data'

interface LoraDBSchema extends DBSchema {
  'applications-app-specs': {
    key: string
    value: AppSpecVersion[]
  }
}

export async function getDb(networkId: string) {
  return await openDB<LoraDBSchema>(networkId, 1, {
    upgrade(db, oldVersion, newVersion) {
      const migrationsToRun = dbMigrations.slice(oldVersion, newVersion ?? undefined)
      migrationsToRun.forEach((migration) => {
        migration(db)
      })
    },
  })
}

const dbMigrations = [
  (db: IDBPDatabase<LoraDBSchema>) => {
    db.createObjectStore('applications-app-specs')
  },
]

export const dbAtom = atom(async (get) => {
  const networkId = get(selectedNetworkAtomId)
  return await getDb(networkId)
})
