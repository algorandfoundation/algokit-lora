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

  const { activeAccount: useWalletAccount } = useWallet()
  const setUseWalletAccount = useSetAtom(walletAccountAtom)

  useEffect(() => {
    setUseWalletAccount(useWalletAccount ?? undefined)
  }, [setUseWalletAccount, useWalletAccount])

  // useAtom(activeAccountStaleEffect)

  return <UseWalletProvider value={walletProviders}>{children}</UseWalletProvider>
}
