import { NetworkConfig, useNetworkConfig, useTheme } from '@/features/settings/data'
import { PropsWithChildren, useEffect } from 'react'
import { JotaiStore } from '../data/types'
import { useDataStore } from '../data/data-store'
import { Provider } from 'jotai'

type ContextualDataProviderProps = PropsWithChildren<{
  networkConfig: NetworkConfig
  store?: JotaiStore // This is only used for unit tests
}>

// TODO: NC - Need to think about naming here
function ContextualDataProvider({ children, networkConfig, store }: ContextualDataProviderProps) {
  // Creates a new data store depending on the network
  // TODO: NC - Can we describe this better?
  const dataStore = useDataStore(networkConfig, store)

  return (
    <Provider key={networkConfig.id} store={dataStore}>
      {children}
    </Provider>
  )
}

type Props = PropsWithChildren<{
  store?: JotaiStore // This is only used for unit tests
}>

export function DataProvider({ children, store }: Props) {
  const networkConfig = useNetworkConfig()
  const [theme] = useTheme()

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  return (
    <ContextualDataProvider key={networkConfig.id} networkConfig={networkConfig} store={store}>
      {children}
    </ContextualDataProvider>
  )
}
