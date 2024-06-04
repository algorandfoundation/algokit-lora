import { useNetworkConfig } from '@/features/settings/data'
import { PropsWithChildren } from 'react'
import { PROVIDER_ID, useInitializeProviders } from '@txnlab/use-wallet'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { PeraWalletConnect } from '@perawallet/connect'
import LuteConnect from 'lute-connect'
import algosdk from 'algosdk'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { PlatformProviderInner } from './platform-provider-inner'

export function PlatformProvider({ children }: PropsWithChildren) {
  const networkConfig = useNetworkConfig()

  const walletProviders = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
      { id: PROVIDER_ID.DAFFI, clientStatic: DaffiWalletConnect },
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
      { id: PROVIDER_ID.EXODUS },
      {
        id: PROVIDER_ID.LUTE,
        clientStatic: LuteConnect,
        clientOptions: { siteName: 'Algorand Studio' },
      },
    ],
    nodeConfig: {
      network: networkConfig.id,
      nodeServer: networkConfig.algod.server,
      nodePort: networkConfig.algod.port,
    },
    algosdkStatic: algosdk,
  })

  return (
    // The key passed to PlatformProviderInner is important as it controls the storeRef in useDataStore
    <PlatformProviderInner key={networkConfig.id} networkConfig={networkConfig} walletProviders={walletProviders}>
      {children}
    </PlatformProviderInner>
  )
}
