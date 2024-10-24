import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Account, PROVIDER_ID, Provider, useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogContent, DialogHeader, SmallSizeDialogBody } from '@/features/common/components/dialog'
import { ellipseAddress } from '@/utils/ellipse-address'
import { AccountLink } from '@/features/accounts/components/account-link'
import { Loader2 as Loader, CircleMinus, Wallet } from 'lucide-react'
import { useNetworkConfig } from '@/features/network/data'
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
import { clearAvailableWallets } from '../utils/clear-available-wallets'
import { useDisconnectWallet } from '../hooks/use-disconnect-wallet'
import { CopyButton } from '@/features/common/components/copy-button'
import { useLoadableReverseLookupNfdResult } from '@/features/nfd/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'

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
    <Button className="hidden w-36 md:flex" variant="outline" onClick={connect} aria-label={connectWalletLabel}>
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

function ConnectedWallet({ activeAddress, connectedActiveAccounts, providers }: ConnectedWalletProps) {
  const activeProvider = useMemo(() => providers?.find((p) => p.isActive), [providers])
  const disconnectWallet = useDisconnectWallet(activeProvider)

  const switchAccount = useCallback(
    (address: string) => {
      if (activeProvider) {
        activeProvider.setActiveAccount(address)
      } else {
        clearAvailableWallets()
      }
    },
    [activeProvider]
  )
  const loadableNfd = useLoadableReverseLookupNfdResult(activeAddress)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="hidden w-40 p-2 md:flex" variant="outline">
          {activeProvider &&
            ([PROVIDER_ID.KMD, PROVIDER_ID.MNEMONIC].includes(activeProvider.metadata.id) ? (
              <Wallet className={cn('size-6 rounded object-contain mr-2')} />
            ) : (
              <img
                src={activeProvider.metadata.icon}
                alt={`${activeProvider.metadata.name} icon`}
                className={cn('size-6 rounded object-contain mr-2')}
              />
            ))}
          <abbr title={activeAddress} className="truncate no-underline">
            <RenderLoadable loadable={loadableNfd} fallback={ellipseAddress(activeAddress)}>
              {(nfd) => (nfd ? nfd.name : ellipseAddress(activeAddress))}
            </RenderLoadable>
          </abbr>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 border p-2" onOpenAutoFocus={preventDefault}>
        <div className={cn('flex items-center')}>
          {connectedActiveAccounts.length === 1 ? (
            <abbr className="ml-1 text-sm">{ellipseAddress(connectedActiveAccounts[0].address)}</abbr>
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
          <CopyButton value={activeAddress} />
          <AccountLink address={activeAddress} className={cn('pl-2 text-primary underline text-sm ml-auto')}>
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

  const [availableProviderIds, availableProviders] = useMemo(() => {
    return [providers?.map((p) => p.metadata.id) ?? [], providers ?? []] as const
  }, [providers])

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
      <Button className="hidden w-36 md:flex" variant="outline" disabled>
        <Loader className="mr-2 size-4 animate-spin" />
        Loading
      </Button>
    )
  } else if (activeAddress) {
    button = <ConnectedWallet activeAddress={activeAddress} connectedActiveAccounts={connectedActiveAccounts} providers={providers} />
  } else {
    if (availableProviderIds.includes(PROVIDER_ID.KMD)) {
      button = <ConnectWallet onConnect={refreshAvailableKmdWallets} />
    } else {
      button = <ConnectWallet />
    }
  }

  let walletProviders = <p>No wallet providers available</p>
  if (!isReady) {
    walletProviders = (
      <>
        {networkConfig.walletProviders.map((providerId) => (
          // Ensures that if the dialog is open and useWallet is reinitialised, the height stays consistent.
          <div className="h-10" key={`placeholder-${providerId}`}>
            &nbsp;
          </div>
        ))}
      </>
    )
  } else if (!activeAddress && availableProviders.length > 0) {
    walletProviders = (
      <>
        {availableProviders.map((provider) =>
          provider.metadata.id === PROVIDER_ID.KMD ? (
            <KmdProviderConnectButton key={`provider-${provider.metadata.id}`} provider={provider} onConnect={selectProvider(provider)} />
          ) : (
            <ProviderConnectButton key={`provider-${provider.metadata.id}`} provider={provider} onConnect={selectProvider(provider)} />
          )
        )}
      </>
    )
  }
  return (
    <>
      {button}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card" onOpenAutoFocus={preventDefault}>
          <DialogHeader>
            <h2 className="pb-0">Wallet Providers</h2>
          </DialogHeader>
          <SmallSizeDialogBody className="flex flex-col space-y-4">{walletProviders}</SmallSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
