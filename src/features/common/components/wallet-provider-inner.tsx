import { PropsWithChildren } from 'react'
import { useSetActiveWalletState } from '@/features/wallet/data/active-wallet'
import { useWallet, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { encodeTransaction, Transaction } from '@algorandfoundation/algokit-utils/transact'

type Props = PropsWithChildren<{
  walletManager: WalletManager
}>

function SetActiveWalletState({ children }: PropsWithChildren) {
  const { isReady, activeAddress, signTransactions } = useWallet()
  useSetActiveWalletState(isReady, activeAddress ?? undefined, async (txnGroup: Transaction[], indexesToSign: number[]) => {
    const encodedTxns = txnGroup.map((txn) => encodeTransaction(txn))
    const signResults = await signTransactions(encodedTxns, indexesToSign)
    return signResults.filter((r) => r !== null)
  })

  return <>{children}</>
}

export function WalletProviderInner({ walletManager, children }: Props) {
  return (
    <WalletProvider manager={walletManager}>
      <SetActiveWalletState>{children}</SetActiveWalletState>
    </WalletProvider>
  )
}
