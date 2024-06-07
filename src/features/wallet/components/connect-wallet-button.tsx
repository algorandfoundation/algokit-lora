import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Account, Provider, useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { ellipseAddress } from '@/utils/ellipse-address'
import { buttonVariants } from '@/features/common/components/button'
import { AccountLink } from '@/features/accounts/components/account-link'
import { Loader2 as Loader, CircleMinus, Wallet } from 'lucide-react'
import { localnetConfig, useNetworkConfig } from '@/features/settings/data'
import { useCallback, useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/features/common/components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { Label } from '@/features/common/components/label'

export const connectWalletLabel = 'Connect Wallet'
export const disconnectWalletLabel = 'Disconnect Wallet'
export const selectAccountLabel = 'Account Selector'

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
      <Button className="w-36" variant="default" onClick={() => setDialogOpen(true)} aria-label={connectWalletLabel}>
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
                  {localnetConfig.walletProviders.includes(provider.metadata.id) ? (
                    <Wallet className={cn('size-6 rounded object-contain mr-2')} />
                  ) : (
                    <img
                      src={provider.metadata.icon}
                      alt={`${provider.metadata.name} icon`}
                      className="h-auto w-6 rounded object-contain"
                    />
                  )}
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

const preventDefault = (e: Event) => {
  e.preventDefault()
}

const forceRemoveConnectedWallet = () => {
  // A fallback cleanup mechanism in the rare case of provider configuration and state being out of sync.
  localStorage.removeItem('txnlab-use-wallet')
  window.location.reload()
}

export function ConnectedWallet({ activeAddress, connectedActiveAccounts, providers }: ConnectedWalletProps) {
  const activeProvider = useMemo(() => providers?.find((p) => p.isActive), [providers])

  const disconnectWallet = useCallback(() => {
    if (activeProvider) {
      activeProvider.disconnect()
    } else {
      forceRemoveConnectedWallet()
    }
  }, [activeProvider])

  const switchAccount = useCallback(
    (address: string) => {
      if (activeProvider) {
        activeProvider.setActiveAccount(address)
      } else {
        forceRemoveConnectedWallet()
      }
    },
    [activeProvider]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-36" variant="default">
          {activeProvider &&
            (localnetConfig.walletProviders.includes(activeProvider.metadata.id) ? (
              <Wallet className={cn('size-6 rounded object-contain mr-2')} />
            ) : (
              <img
                src={activeProvider.metadata.icon}
                alt={`${activeProvider.metadata.name} icon`}
                className={cn('size-6 rounded object-contain mr-2')}
              />
            ))}
          <abbr title={activeAddress} className="no-underline">
            {ellipseAddress(activeAddress)}
          </abbr>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 border border-input bg-card p-2 text-card-foreground" onOpenAutoFocus={preventDefault}>
        <div className={cn('flex items-center')}>
          {connectedActiveAccounts.length === 1 ? (
            <abbr className="ml-1 ">{ellipseAddress(connectedActiveAccounts[0].address, 6)}</abbr>
          ) : (
            <>
              <Label hidden={true} htmlFor="account">
                Select Account
              </Label>
              <Select onValueChange={switchAccount} value={activeAddress}>
                <SelectTrigger id="account" aria-label={selectAccountLabel} className={cn('h-9')}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className={cn('bg-card text-card-foreground')}>
                  {connectedActiveAccounts.map((account) => (
                    <SelectItem key={account.address} value={account.address}>
                      {ellipseAddress(account.address)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          <AccountLink address={activeAddress} className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'ml-2')}>
            Details
          </AccountLink>
        </div>
        <div className={cn('flex items-center')}>
          <Button variant="outline" size="sm" onClick={disconnectWallet} className="mt-2 w-full bg-card" aria-label={disconnectWalletLabel}>
            <CircleMinus className="mr-2 size-4" />
            Disconnect
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ConnectWalletButton() {
  const { activeAddress, connectedActiveAccounts, providers, isReady } = useWallet()

  if (!isReady) {
    return (
      <Button className="w-36" disabled>
        <Loader className="mr-2 size-4 animate-spin" />
        Loading
      </Button>
    )
  }

  if (activeAddress) {
    return <ConnectedWallet activeAddress={activeAddress} connectedActiveAccounts={connectedActiveAccounts} providers={providers} />
  }

  return <ConnectWallet activeAddress={activeAddress} providers={providers} />
}
