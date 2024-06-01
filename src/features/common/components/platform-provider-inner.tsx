import { PropsWithChildren, useEffect } from 'react'
import { useDataStore } from '../data/data-store'
import { Provider as DataProvider } from 'jotai'
import { JotaiStore } from '../data/types'
import { WalletProvider } from './wallet-provider'
import { NetworkConfig, useTheme } from '@/features/settings/data'
import { SupportedProviders } from '@txnlab/use-wallet'

type Props = PropsWithChildren<{
  key: string
  networkConfig: NetworkConfig
  walletProviders: SupportedProviders | null
  store?: JotaiStore // This is only used for unit tests
}>

export function PlatformProviderInner({ networkConfig, store, walletProviders, children }: Props) {
  const dataStore = useDataStore(networkConfig, store)

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
    <DataProvider key={networkConfig.id} store={dataStore}>
      <WalletProvider networkConfig={networkConfig} walletProviders={walletProviders}>
        {children}
      </WalletProvider>
    </DataProvider>
  )
}
