import { NetworkConfig } from '@/features/settings/data'
import { useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren, useEffect } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfig
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

function DisconnectWallets({ networkConfig }: Omit<Props, 'key' | 'initOptions' | 'children'>) {
  const { providers } = useWallet()

  // TODO: NC - This should just be a hook
  // TODO: NC - It might make sense to just blindly disconnect all wallets as part of networking switching
  // TODO: NC - We can then conditionally register the prodviders
  useEffect(() => {
    // Disconnect wallets that aren't applicable to the chosen network
    providers?.forEach((provider) => {
      if (provider.isConnected && !networkConfig.walletProviders.includes(provider.metadata.id)) {
        provider.disconnect()
      }
    })
  }, [networkConfig.walletProviders, providers])

  return undefined
}

export function WalletProviderInner({ networkConfig, initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  return (
    <UseWalletProvider value={walletProviders}>
      <DisconnectWallets networkConfig={networkConfig} />
      {children}
    </UseWalletProvider>
  )
}
