import { Provider, createStore } from 'jotai'
import { useNetworkConfig } from '../data/network'
import { useEffect } from 'react'
import { setNetwork } from '../../common/data'
import { useTheme } from '../data'

type Props = {
  children: React.ReactNode
}

export let dataStore = createStore()

export function SettingsProvider({ children }: Props) {
  const networkConfig = useNetworkConfig()
  const [theme] = useTheme()

  useEffect(() => {
    setNetwork(networkConfig)
    dataStore = createStore()
  }, [networkConfig])

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
    <Provider key={networkConfig.id} store={dataStore}>
      {children}
    </Provider>
  )
}
