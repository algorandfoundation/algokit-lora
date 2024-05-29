import { PROVIDER_ID, WalletProvider, useInitializeProviders } from '@txnlab/use-wallet'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { mainnetConfig } from '@/features/settings/data'
import algosdk from 'algosdk'
import { ConnectWallet } from './connect-wallet'

export function ProvidersSection() {
  const providers = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
      { id: PROVIDER_ID.DAFFI, clientStatic: DaffiWalletConnect },
      { id: PROVIDER_ID.EXODUS },
    ],
    nodeConfig: {
      network: mainnetConfig.id,
      nodeServer: mainnetConfig.algod.server,
      nodePort: mainnetConfig.algod.port,
    },
    algosdkStatic: algosdk,
  })
  return (
    <div>
      <WalletProvider value={providers}>
        <div>
          <ConnectWallet />
        </div>
      </WalletProvider>
    </div>
  )
}
