import { testnetConfig } from '@/features/settings/data'
import { PropsWithChildren } from 'react'
import { PROVIDER_ID, useInitializeProviders } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import { JotaiStore } from '@/features/common/data/types'
import { PlatformProviderInner } from '@/features/common/components/platform-provider-inner'

type Props = PropsWithChildren<{
  store?: JotaiStore
}>

export function TestPlatformProvider({ children, store }: Props) {
  const networkConfig = testnetConfig

  const walletProviders = useInitializeProviders({
    providers: [{ id: PROVIDER_ID.EXODUS }], // Providers are mocked. This is just to satisfy NonEmptyArray.
    nodeConfig: {
      network: networkConfig.id,
      nodeServer: networkConfig.algod.server,
      nodePort: networkConfig.algod.port,
    },
    algosdkStatic: algosdk,
  })

  return (
    <PlatformProviderInner key={networkConfig.id} networkConfig={networkConfig} walletProviders={walletProviders} store={store}>
      {children}
    </PlatformProviderInner>
  )
}
