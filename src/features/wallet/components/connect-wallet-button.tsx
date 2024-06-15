import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Account, PROVIDER_ID, Provider, clearAccounts, useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { ellipseAddress } from '@/utils/ellipse-address'
import { buttonVariants } from '@/features/common/components/button'
import { AccountLink } from '@/features/accounts/components/account-link'
import { Loader2 as Loader, CircleMinus, Wallet } from 'lucide-react'
import { localnetConfig, mainnetConfig, useNetworkConfig } from '@/features/settings/data'
import { useCallback, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/features/common/components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { Label } from '@/features/common/components/label'
import { asError } from '@/utils/error'
import { toast } from 'react-toastify'
import { useRefreshAvailableKmdWallets } from '../data/kmd'
import { useAtom, useSetAtom } from 'jotai'
import { ProviderConnectButton } from './provider-connect-button'
import { KmdProviderConnectButton } from './kmd-provider-connect-button'
import { walletDialogOpenAtom } from '../data/wallet-dialog'

export const connectWalletLabel = 'Connect Wallet'
export const disconnectWalletLabel = 'Disconnect Wallet'
export const selectAccountLabel = 'Account Selector'

type ConnectWalletProps = {
  onConnect?: () => void
}

function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const setDialogOpen = useSetAtom(walletDialogOpenAtom)

  const connect = useCallback(() => {
    setDialogOpen(true)
    onConnect && onConnect()
  }, [onConnect, setDialogOpen])

  return (
    <Button className="w-36" variant="outline" onClick={connect} aria-label={connectWalletLabel}>
      {connectWalletLabel}
    </Button>
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
  mainnetConfig.walletProviders.forEach((provider) => {
    clearAccounts(provider)
  })
  localnetConfig.walletProviders.forEach((provider) => {
    clearAccounts(provider)
  })
}

function ConnectedWallet({ activeAddress, connectedActiveAccounts, providers }: ConnectedWalletProps) {
  const activeProvider = useMemo(() => providers?.find((p) => p.isActive), [providers])

  const disconnectWallet = useCallback(async () => {
    if (activeProvider) {
      await activeProvider.disconnect()
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
        <Button className="w-36" variant="outline">
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
      <PopoverContent align="end" className="w-60 border p-2" onOpenAutoFocus={preventDefault}>
        <div className={cn('flex items-center')}>
          {connectedActiveAccounts.length === 1 ? (
            <abbr className="ml-1 w-full">{ellipseAddress(connectedActiveAccounts[0].address, 6)}</abbr>
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
          <AccountLink address={activeAddress} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'ml-2')}>
            View
          </AccountLink>
        </div>
        <div className={cn('flex items-center')}>
          <Button variant="outline" size="sm" onClick={disconnectWallet} className="mt-2 w-full" aria-label={disconnectWalletLabel}>
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
  const [dialogOpen, setDialogOpen] = useAtom(walletDialogOpenAtom)
  const networkConfig = useNetworkConfig()
  const refreshAvailableKmdWallets = useRefreshAvailableKmdWallets()

  let button = <></>

  const availableProviders = useMemo(
    () => providers?.filter((p) => networkConfig.walletProviders.includes(p.metadata.id)) ?? [],
    [networkConfig.walletProviders, providers]
  )

  const selectProvider = useCallback(
    (provider: Provider) => async () => {
      setTimeout(() => setDialogOpen(false), 1000)
      try {
        if (provider.isConnected) {
          provider.setActiveProvider()
        } else {
          await provider.connect(undefined, true)
        }
      } catch (e: unknown) {
        const error = asError(e)
        toast.error(error.message)
      }
    },
    [setDialogOpen]
  )

  if (!isReady) {
    button = (
      <Button className="w-36" variant="outline" disabled>
        <Loader className="mr-2 size-4 animate-spin" />
        Loading
      </Button>
    )
  } else if (activeAddress) {
    button = <ConnectedWallet activeAddress={activeAddress} connectedActiveAccounts={connectedActiveAccounts} providers={providers} />
  } else {
    if (networkConfig.id === localnetConfig.id) {
      button = <ConnectWallet onConnect={refreshAvailableKmdWallets} />
    } else {
      button = <ConnectWallet />
    }
  }

  return (
    <>
      {button}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="w-[500px] bg-card" onOpenAutoFocus={preventDefault}>
          <DialogHeader>
            <h2>Wallet Providers</h2>
          </DialogHeader>
          <div className="flex flex-col space-y-2">
            {!isReady
              ? networkConfig.walletProviders.map((providerId) => (
                  // Ensures that if the dialog is open and useWallet is reinitialised, the height stays consistent.
                  <div className="h-10" key={`placeholder-${providerId}`}>
                    &nbsp;
                  </div>
                ))
              : !activeAddress &&
                availableProviders.map((provider) =>
                  provider.metadata.id === PROVIDER_ID.KMD ? (
                    <KmdProviderConnectButton
                      key={`provider-${provider.metadata.id}`}
                      provider={provider}
                      onConnect={selectProvider(provider)}
                    />
                  ) : (
                    <ProviderConnectButton
                      key={`provider-${provider.metadata.id}`}
                      provider={provider}
                      onConnect={selectProvider(provider)}
                    />
                  )
                )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
