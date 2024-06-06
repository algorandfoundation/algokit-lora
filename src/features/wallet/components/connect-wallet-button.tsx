import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Account, Provider, useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { ellipseAddress } from '@/utils/ellipse-address'
import { buttonVariants } from '@/features/common/components/button'
import { AccountLink } from '@/features/accounts/components/account-link'
import { Loader2 as Loader, Wallet, Copy } from 'lucide-react'
import { useNetworkConfig } from '@/features/settings/data'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/features/common/components/popover'
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/features/common/components/select'

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
    <Popover>
      <PopoverTrigger asChild>
        <Button className={cn(buttonVariants({ variant: 'default' }))}>
          <div className={cn('h-auto w-4 rounded object-contain mr-3')}>
            <Wallet />
          </div>
          <abbr title={currentActiveAddress} className="no-underline">
            {ellipseAddress(currentActiveAddress)}
          </abbr>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-72 border border-input bg-card p-2 text-card-foreground">
        <div className={cn('flex items-center')}>
          {activeProvider && (
            <img
              src={activeProvider.metadata.icon}
              alt={`${activeProvider.metadata.name} icon`}
              className={cn('h-auto w-6 rounded object-contain mr-2')}
            />
          )}
          <p>{ellipseAddress(currentActiveAddress, 9)}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 rounded-md px-3"
            onClick={() => navigator.clipboard.writeText(currentActiveAddress)}
          >
            <Copy />
          </Button>
        </div>
        <div className={cn('grid grid-cols-2 gap-4')}>
          <div className={cn('flex items-center')}>
            <AccountLink address={currentActiveAddress} className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}>
              View Account
            </AccountLink>
          </div>
          <Button variant="destructive" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
        <SelectSeparator />
        <div className={cn('flex w-42 flex-col')}>
          <Select
            onValueChange={(selectedAddress) => {
              const selectedAccount = connectedActiveAccounts.find((account) => ellipseAddress(account.address) === selectedAddress)
              if (selectedAccount) {
                changeAccount(selectedAccount)
              }
            }}
          >
            <SelectTrigger className={cn('h-7')}>
              <SelectValue placeholder={ellipseAddress(currentActiveAddress, 10)} />
            </SelectTrigger>
            <SelectContent className={cn('bg-card text-card-foreground')}>
              {connectedActiveAccounts.map((account) => (
                <SelectItem key={account.address} value={ellipseAddress(account.address)}>
                  {ellipseAddress(account.address, 10)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
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
