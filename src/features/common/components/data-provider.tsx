import { NetworkConfig, useNetworkConfig, useTheme } from '@/features/settings/data'
import { PropsWithChildren, useEffect } from 'react'
import { JotaiStore } from '../data/types'
import { useDataStore } from '../data/data-store'
import { Provider } from 'jotai'
import { PROVIDER_ID, WalletProvider, useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import LuteConnect from 'lute-connect'
import algosdk from 'algosdk'

type ContextualDataProviderProps = PropsWithChildren<{
  networkConfig: NetworkConfig
  store?: JotaiStore // This is only used for unit tests
}>

function JotaiDataProvider({ children, networkConfig, store }: ContextualDataProviderProps) {
  const { providers } = useWallet()
  const activeProvider = providers?.find((p) => p.isActive)
  const dataStore = useDataStore(networkConfig, store, activeProvider)

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

  const providers = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
      { id: PROVIDER_ID.DAFFI, clientStatic: DaffiWalletConnect },
      { id: PROVIDER_ID.EXODUS },
      {
        id: PROVIDER_ID.LUTE,
        clientStatic: LuteConnect,
        clientOptions: { siteName: 'Algorand Explorer' },
      },
    ],
    nodeConfig: {
      network: networkConfig.id,
      nodeServer: networkConfig.algod.server,
      nodePort: networkConfig.algod.port,
    },
    algosdkStatic: algosdk,
  })

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
    <WalletProvider value={providers}>
      <JotaiDataProvider key={networkConfig.id} networkConfig={networkConfig} store={store}>
        {children}
      </JotaiDataProvider>
    </WalletProvider>
  )
}
