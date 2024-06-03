import { NetworkConfig } from '@/features/settings/data'
import { SupportedProviders, WalletProvider as UseWalletProvider, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren, useEffect } from 'react'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfig
  walletProviders: SupportedProviders | null
}>

function WalletProviderInner({ networkConfig, children }: Omit<Props, 'walletProviders'>) {
  const { providers } = useWallet()

  useEffect(() => {
    // Disconnect wallets that aren't applicable to the chosen network
    providers?.forEach((provider) => {
      if (provider.isConnected && !networkConfig.walletProviders.includes(provider.metadata.id)) {
        provider.disconnect()
      }
    })
  }, [networkConfig.walletProviders, providers])

  return children
}

export function WalletProvider({ networkConfig, walletProviders, children }: Props) {
  return (
    <UseWalletProvider value={walletProviders}>
      <WalletProviderInner networkConfig={networkConfig}>{children}</WalletProviderInner>
    </UseWalletProvider>
  )
}
