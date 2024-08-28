import { useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'
import { useSetActiveWalletAddress } from '@/features/wallet/data/active-wallet'

type Props = PropsWithChildren<{
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

export function WalletProviderInner({ initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  const { activeAddress, isReady } = useWallet()
  useSetActiveWalletAddress(isReady, activeAddress)

  return <UseWalletProvider value={walletProviders}>{children}</UseWalletProvider>
}
