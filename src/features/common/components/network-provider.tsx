import { Provider, createStore, useAtomValue } from 'jotai'
import { networkConfigAtom } from '../data/network'
import { globalStore } from '@/features/common/data'
import { useEffect } from 'react'
import { setNetwork } from '../data'

type Props = {
  children: React.ReactNode
}

export const dataStore = createStore()

export function NetworkProvider({ children }: Props) {
  const networkConfig = useAtomValue(networkConfigAtom, { store: globalStore })

  useEffect(() => {
    setNetwork(networkConfig)
  }, [networkConfig])

  return (
    <Provider key={networkConfig.id} store={dataStore}>
      {children}
    </Provider>
  )
}
