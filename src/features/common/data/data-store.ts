import { updateClientConfig } from '@/features/common/data'
import { JotaiStore } from '@/features/common/data/types'
import { createStore } from 'jotai'
import { useRef } from 'react'
import { NetworkConfig } from '../../settings/data/network'
import { Provider } from '@txnlab/use-wallet'

export let dataStore: JotaiStore

export const useDataStore = (networkConfig: NetworkConfig, store?: JotaiStore, activeWalletProvider?: Provider) => {
  const storeRef = useRef<JotaiStore>()
  if (!storeRef.current) {
    dataStore = store ?? createStore()
    storeRef.current = dataStore
    updateClientConfig(networkConfig)
    if (networkConfig.id === 'localnet') {
      if (activeWalletProvider) {
        activeWalletProvider.disconnect()
      } else {
        localStorage.removeItem('txnlab-use-wallet')
        // window.location.reload() // Do we need this
      }
    }
  }

  return storeRef.current
}
