import { useInitializeProviders, useWallet } from '@txnlab/use-wallet'
import { PropsWithChildren, useEffect } from 'react'
import { WalletProvider as UseWalletProvider } from '@txnlab/use-wallet'
import { activeAccountAtom, getActiveAccount, isActiveAccountStaleAtom } from '@/features/accounts/data/active-account'
import { useAtom } from 'jotai'

type Props = PropsWithChildren<{
  initOptions: Parameters<typeof useInitializeProviders>[0]
}>

export function WalletProviderInner({ initOptions, children }: Props) {
  const walletProviders = useInitializeProviders(initOptions)

  const { activeAccount: account } = useWallet()
  const [activeAccount, setActiveAccount] = useAtom(activeAccountAtom)
  const [isActiveAccountStale, setIsActiveAccountStale] = useAtom(isActiveAccountStaleAtom)

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

  useEffect(() => {
    ;(async () => {
      if (activeAccount && isActiveAccountStale) {
        const newActiveAccount = await getActiveAccount(activeAccount.address)

        setIsActiveAccountStale(false)
        setActiveAccount(newActiveAccount)
      }
    })()
  }, [activeAccount, isActiveAccountStale, setActiveAccount, setIsActiveAccountStale])

  return <UseWalletProvider value={walletProviders}>{children}</UseWalletProvider>
}
