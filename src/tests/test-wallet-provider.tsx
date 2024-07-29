import { NetworkConfigWithId } from '@/features/network/data/types'
import { PROVIDER_ID, useInitializeProviders } from '@txnlab/use-wallet'
import { PropsWithChildren } from 'react'
import algosdk from 'algosdk'
import { WalletProviderInner } from '@/features/common/components/wallet-provider-inner'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfigWithId
}>

export function TestWalletProvider({ networkConfig, children }: Props) {
  const options = {
    providers: [PROVIDER_ID.MNEMONIC], // Providers are mocked. This is just to satisfy NonEmptyArray.
    nodeConfig: {
      network: networkConfig.id,
      nodeServer: networkConfig.algod.server,
      nodePort: networkConfig.algod.port,
    },
    algosdkStatic: algosdk,
  } as Parameters<typeof useInitializeProviders>[0]

  return <WalletProviderInner initOptions={options}>{children}</WalletProviderInner>
}
