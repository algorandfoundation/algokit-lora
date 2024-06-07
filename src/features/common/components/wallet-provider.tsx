import { NetworkConfig } from '@/features/settings/data'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { PROVIDER_ID, useInitializeProviders } from '@txnlab/use-wallet'
import LuteConnect from 'lute-connect'
import { PropsWithChildren } from 'react'
import algosdk from 'algosdk'
import { WalletProviderInner } from './wallet-provider-inner'
import { defaultKmdWallet, useSelectedKmdWallet } from '@/features/wallet/data/kmd'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfig
}>

export function WalletProvider({ networkConfig, children }: Props) {
  const selectedKmdWallet = useSelectedKmdWallet()

  const key = `${networkConfig.id}-${selectedKmdWallet ?? ''}`

  const initOptions = {
    providers:
      networkConfig.id === 'localnet'
        ? [
            {
              id: PROVIDER_ID.KMD,
              clientOptions: {
                wallet: selectedKmdWallet ?? defaultKmdWallet,
                password: '', // This is never actually used by the provider, however needs to be set.
                host: networkConfig.kmd?.server ?? '',
                token: networkConfig.kmd?.token ?? '',
                port: String(networkConfig.kmd?.port ?? 0),
              },
            },
          ]
        : [
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
  } as Parameters<typeof useInitializeProviders>[0]

  return (
    // The key prop is super important it governs if the provider is reinitialized
    <WalletProviderInner key={key} initOptions={initOptions}>
      {children}
    </WalletProviderInner>
  )
}
