import { PropsWithChildren } from 'react'
import { useSetActiveWalletState } from '@/features/wallet/data/active-wallet'
import { useWallet, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'

type Props = PropsWithChildren<{
  walletManager: WalletManager
}>

function SetActiveWalletState({ children }: PropsWithChildren) {
  const { activeAddress, transactionSigner } = useWallet()
  useSetActiveWalletState(activeAddress ?? undefined, transactionSigner)

  return <>{children}</>
}

export function WalletProviderInner({ walletManager, children }: Props) {
  return (
    <WalletProvider manager={walletManager}>
      <SetActiveWalletState>{children}</SetActiveWalletState>
    </WalletProvider>
  )
}
