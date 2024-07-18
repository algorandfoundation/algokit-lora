import { JotaiStore } from '../data/types'
import { useDataStore } from '../data/data-store'
import { Provider as JotaiProvider } from 'jotai'
import { PropsWithChildren } from 'react'
import { NetworkConfigWithId } from '@/features/network/data/types'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfigWithId
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
