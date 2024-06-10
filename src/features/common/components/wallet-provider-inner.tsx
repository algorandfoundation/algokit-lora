import { useInitializeProviders } from '@txnlab/use-wallet'
import { PropsWithChildren } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'

type Props = PropsWithChildren<{
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

export function WalletProviderInner({ initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  return <UseWalletProvider value={walletProviders}>{children}</UseWalletProvider>
}
