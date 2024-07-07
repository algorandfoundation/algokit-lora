import { useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren, useEffect } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'
import { walletAccountAtom } from '@/features/wallet/data/active-wallet-account'
import { useSetAtom } from 'jotai'

type Props = PropsWithChildren<{
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

export function WalletProviderInner({ initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  const { activeAccount: walletAccount } = useWallet()
  const setWalletAccount = useSetAtom(walletAccountAtom)

  useEffect(() => {
    setWalletAccount(walletAccount ?? undefined)
  }, [setWalletAccount, walletAccount])

  return <UseWalletProvider value={walletProviders}>{children}</UseWalletProvider>
}
