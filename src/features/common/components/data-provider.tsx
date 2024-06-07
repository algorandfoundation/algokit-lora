import { NetworkConfig } from '@/features/settings/data'
import { JotaiStore } from '../data/types'
import { useDataStore } from '../data/data-store'
import { Provider as JotaiProvider } from 'jotai'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfig
  store?: JotaiStore // This is only used for unit tests
}>

export function DataProvider({ networkConfig, store, children }: Props) {
  const dataStore = useDataStore(networkConfig, store)

  return (
    <JotaiProvider key={networkConfig.id} store={dataStore}>
      {children}
    </JotaiProvider>
  )
}
