import { Provider, createStore } from 'jotai'
import { useNetworkConfig } from '../data/network'
import { useEffect } from 'react'
import { setNetwork } from '../../common/data'

type Props = {
  children: React.ReactNode
}

export let dataStore = createStore()

export function SettingsProvider({ children }: Props) {
  const networkConfig = useNetworkConfig()

  useEffect(() => {
    setNetwork(networkConfig)
    dataStore = createStore()
  }, [networkConfig])

  return (
    <Provider key={networkConfig.id} store={dataStore}>
      {children}
    </Provider>
  )
}
