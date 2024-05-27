import { updateNetworkConfig } from '@/features/common/data'
import { JotaiStore } from '@/features/common/data/types'
import { createStore } from 'jotai'
import { useRef } from 'react'
import { NetworkConfig } from '../../settings/data/network'

export let dataStore: JotaiStore

// TODO: NC - This also updates the network config
export const useDataStore = (networkConfig: NetworkConfig, store?: JotaiStore) => {
  const storeRef = useRef<JotaiStore>()
  if (!storeRef.current) {
    dataStore = store ?? createStore()
    storeRef.current = dataStore
    updateNetworkConfig(networkConfig)
  }

  return storeRef.current
}
