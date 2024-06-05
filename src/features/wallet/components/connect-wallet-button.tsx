import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Account, Provider, useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { ellipseAddress } from '@/utils/ellipse-address'
import { buttonVariants } from '@/features/common/components/button'
import { AccountLink } from '@/features/accounts/components/account-link'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/features/common/components/hover-card'
import { Loader2 as Loader } from 'lucide-react'
import { useNetworkConfig } from '@/features/settings/data'
import { useCallback, useMemo, useRef, useState } from 'react'

export const connectWalletLabel = 'Connect Wallet'
export const hoverCardLabel = 'Connected Wallet'

type ConnectWalletProps = {
  activeAddress?: string
  providers: Provider[] | null
}

export function ConnectWallet({ activeAddress, providers }: ConnectWalletProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const networkConfig = useNetworkConfig()

  const availableProviders = useMemo(
    () => providers?.filter((p) => networkConfig.walletProviders.includes(p.metadata.id)) ?? [],
    [networkConfig.walletProviders, providers]
  )

  const selectProvider = useCallback(
    (provider: Provider) => async () => {
      setTimeout(() => setDialogOpen(false), 1000)
      if (provider.isConnected) {
        provider.setActiveProvider()
      } else {
        await provider.connect()
      }
    },
    []
  )

  return (
    <div className={cn('mt-1')}>
      <Button variant="default" onClick={() => setDialogOpen(true)} aria-label={connectWalletLabel} className="w-32">
        Connect Wallet
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[500px] bg-card">
          <DialogHeader>
            <h2 className={cn('text-2xl text-primary font-bold')}>Select Algorand Wallet Provider</h2>
          </DialogHeader>
          <div className="flex flex-col space-y-2">
            {!activeAddress &&
              availableProviders.map((provider) => (
                <Button key={`provider-${provider.metadata.id}`} onClick={selectProvider(provider)}>
                  <img src={provider.metadata.icon} alt={`${provider.metadata.name} icon`} className="h-auto w-6 rounded object-contain" />
                  <span className="ml-1">{provider.metadata.name}</span>
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type ConnectedWalletProps = {
  activeAddress: string
  providers: Provider[] | null
  connectedActiveAccounts: Account[]
}

export function ConnectedWallet({ activeAddress, connectedActiveAccounts, providers }: ConnectedWalletProps) {
  const activeProvider = useMemo(() => providers?.find((p) => p.isActive), [providers])
  const [currentActiveAddress, setCurrentActiveAddress] = useState(activeAddress)
  const connectedActiveAccountsRef = useRef(connectedActiveAccounts)

  const disconnectWallet = useCallback(() => {
    if (activeProvider) {
      activeProvider.disconnect()
    } else {
      // Fallback cleanup mechanism in the rare case of provider configuration and state being out of sync.
      localStorage.removeItem('txnlab-use-wallet')
      window.location.reload()
    }
  }, [activeProvider])

  const changeAccount = useCallback(
    (newAccount: Account) => {
      const previousActiveAddress = currentActiveAddress
      setCurrentActiveAddress(newAccount.address)
      connectedActiveAccountsRef.current = connectedActiveAccountsRef.current.map((account) =>
        account.address === newAccount.address ? { ...account, address: previousActiveAddress } : account
      )
    },
    [currentActiveAddress]
  )

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <AccountLink address={currentActiveAddress} className={cn(buttonVariants({ variant: 'default' }), 'w-32')}>
          {activeProvider && (
            <img
              src={activeProvider.metadata.icon}
              alt={`${activeProvider.metadata.name} icon`}
              className={cn('h-auto w-4 rounded object-contain mr-2')}
            />
          )}
          <abbr title={currentActiveAddress} className="no-underline">
            {ellipseAddress(currentActiveAddress)}
          </abbr>
        </AccountLink>
      </HoverCardTrigger>
      <HoverCardContent align="center" className="w-36 border border-input bg-card p-2 text-card-foreground">
        {connectedActiveAccounts
          .filter((account) => account.address !== currentActiveAddress)
          .map((account) => (
            <div key={account.address} className="my-2 text-center">
              <Button variant="default" onClick={() => changeAccount(account)} className="w-full p-4">
                {ellipseAddress(account.address)}
              </Button>
            </div>
          ))}
        <Button variant="default" onClick={disconnectWallet} className="w-full p-4">
          Disconnect
        </Button>
      </HoverCardContent>
    </HoverCard>
  )
}

export function ConnectWalletButton() {
  const { activeAddress, connectedActiveAccounts, providers, isReady } = useWallet()

  if (!isReady) {
    return (
      <Button className="w-32">
        <Loader className="size-5 animate-spin" />
      </Button>
    )
  }

  if (activeAddress) {
    return <ConnectedWallet activeAddress={activeAddress} connectedActiveAccounts={connectedActiveAccounts} providers={providers} />
  }

  return <ConnectWallet activeAddress={activeAddress} providers={providers} />
}
