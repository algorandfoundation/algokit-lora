import { useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren, useEffect } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'
import { walletAccountAtom } from '@/features/accounts/data/active-account'
import { useSetAtom } from 'jotai'

type Props = PropsWithChildren<{
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

export function WalletProviderInner({ initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  const { activeAccount: walletAccount } = useWallet()
  const setUseWalletAccount = useSetAtom(walletAccountAtom)

  useEffect(() => {
    setUseWalletAccount(walletAccount ?? undefined)
  }, [setUseWalletAccount, walletAccount])

  return <UseWalletProvider value={walletProviders}>{children}</UseWalletProvider>
}
