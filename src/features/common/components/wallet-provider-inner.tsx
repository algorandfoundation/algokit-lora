import { useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'
import { useSetActiveWalletState } from '@/features/wallet/data/active-wallet'

type Props = PropsWithChildren<{
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

function SetActiveWalletState({ children }: PropsWithChildren) {
  const { activeAddress, isReady, signer } = useWallet()
  useSetActiveWalletState(isReady, activeAddress, signer)

  return <>{children}</>
}

export function WalletProviderInner({ initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  return (
    <UseWalletProvider value={walletProviders}>
      <SetActiveWalletState>{children}</SetActiveWalletState>
    </UseWalletProvider>
  )
}
