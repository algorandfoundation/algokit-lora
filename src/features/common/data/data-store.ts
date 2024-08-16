import { updateClientConfig } from '@/features/common/data/algo-client'
import { JotaiStore } from '@/features/common/data/types'
import { NetworkConfigWithId } from '@/features/network/data/types'
import { createStore } from 'jotai'
import { useRef } from 'react'
import { updateDbConnection } from '@/features/common/data/indexed-db'

export let dataStore: JotaiStore

export const useDataStore = (networkConfig: NetworkConfigWithId, store?: JotaiStore) => {
  const storeRef = useRef<JotaiStore>()
  if (!storeRef.current) {
    dataStore = store ?? createStore()
    storeRef.current = dataStore
    updateClientConfig(networkConfig)
    updateDbConnection(networkConfig.id)
  }

  return storeRef.current
}
