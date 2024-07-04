import { useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren, useEffect } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'
import { activeAccountAtom, activeAccountStaleEffect, getActiveAccount } from '@/features/accounts/data/active-account'
import { useAtom, useSetAtom } from 'jotai'

type Props = PropsWithChildren<{
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

export function WalletProviderInner({ initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  const { activeAccount: account } = useWallet()
  const setActiveAccount = useSetAtom(activeAccountAtom)

  useEffect(() => {
    ;(async () => {
      if (account) {
        const newActiveAccount = await getActiveAccount(account.address)
        setActiveAccount(newActiveAccount)
      } else {
        setActiveAccount(undefined)
      }
    })()
  }, [account, setActiveAccount])
  useAtom(activeAccountStaleEffect)

  return <UseWalletProvider value={walletProviders}>{children}</UseWalletProvider>
}
