import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, SmallSizeDialogBody } from '@/features/common/components/dialog'
import { WalletAccount, WalletId, Wallet, useWallet } from '@txnlab/use-wallet-react'
import { ellipseAddress } from '@/utils/ellipse-address'
import { AccountLink } from '@/features/accounts/components/account-link'
import { CircleMinus, Wallet as WalletIcon } from 'lucide-react'
import { localnetId, useNetworkConfig } from '@/features/network/data'
import { useCallback, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/features/common/components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { Label } from '@/features/common/components/label'
import { asError } from '@/utils/error'
import { toast } from 'react-toastify'
import { useRefreshAvailableKmdWallets } from '../data/kmd-wallets'
import { useAtom, useSetAtom } from 'jotai'
import { WalletConnectButton } from './wallet-connect-button'
import { KmdWalletConnectButton } from './kmd-wallet-connect-button'
import { walletDialogOpenAtom } from '../data/wallet-dialog'
import { useDisconnectWallet } from '../hooks/use-disconnect-wallet'
import { CopyButton } from '@/features/common/components/copy-button'
import { useLoadableReverseLookupNfdResult } from '@/features/nfd/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Urls } from '@/routes/urls'
import { useNavigate } from 'react-router-dom'
import { Description } from '@radix-ui/react-dialog'
import { useDisconnectAllWallets } from '../hooks/use-disconnect-all-wallets'

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
    if (onConnect) {
      onConnect()
    }
  }, [onConnect, setDialogOpen])

  return (
    <Button className="flex w-40" variant="outline" onClick={connect} aria-label={connectWalletLabel}>
      {connectWalletLabel}
    </Button>
  )
}

type ConnectedWalletProps = {
  activeAddress: string
  wallets: Wallet[] | null
  activeWalletAccounts: WalletAccount[]
}

const preventDefault = (e: Event) => {
  e.preventDefault()
}

function ConnectedWallet({ activeAddress, activeWalletAccounts, wallets }: ConnectedWalletProps) {
  const activeWallet = useMemo(() => wallets?.find((w) => w.isActive), [wallets])
  const disconnectWallet = useDisconnectWallet(activeWallet)
  const disconnectAllWallets = useDisconnectAllWallets()

  const switchAccount = useCallback(
    (address: string) => {
      if (activeWallet) {
        activeWallet.setActiveAccount(address)
      } else {
        disconnectAllWallets()
      }
    },
    [activeWallet, disconnectAllWallets]
  )
  const loadableNfd = useLoadableReverseLookupNfdResult(activeAddress)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="flex w-40 p-2" variant="outline">
          {activeWallet &&
            ([WalletId.KMD, WalletId.MNEMONIC].includes(activeWallet.id as WalletId) ? (
              <WalletIcon className={cn('size-6 rounded object-contain mr-2')} />
            ) : (
              <img
                src={activeWallet.metadata.icon}
                alt={`${activeWallet.metadata.name} icon`}
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
          {activeWalletAccounts.length === 1 ? (
            <abbr className="ml-1 text-sm">{ellipseAddress(activeWalletAccounts[0].address)}</abbr>
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
                  {activeWalletAccounts.map((account) => (
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

const walletsWithLocalPrompt = [WalletId.KMD.toString(), WalletId.MNEMONIC.toString()]

export function ConnectWalletButton() {
  const { activeAddress, activeWalletAccounts, wallets } = useWallet()
  const [dialogOpen, setDialogOpen] = useAtom(walletDialogOpenAtom)
  const networkConfig = useNetworkConfig()
  const refreshAvailableKmdWallets = useRefreshAvailableKmdWallets()
  const navigate = useNavigate()

  let button = <></>

  const [availableWalletIds, availableWallets] = useMemo(() => {
    return [wallets?.map((w) => w.id) ?? [], wallets ?? []] as const
  }, [wallets])

  const selectWallet = useCallback(
    (wallet: Wallet) => async () => {
      if (walletsWithLocalPrompt.includes(wallet.id)) {
        // The connect dialog for wallet providers handled locally is opened immediately, so the selection dialog should be closed immediately.
        setDialogOpen(false)
      } else {
        // Externally handled connect dialogs have an opening delay, hence the selection dialog should remain open until the connect dialog is visible.
        setTimeout(() => setDialogOpen(false), 1000)
      }

      try {
        if (wallet.isConnected) {
          wallet.setActive()
        } else {
          await wallet.connect()
        }
      } catch (e: unknown) {
        const error = asError(e)
        toast.error(error.message)
      }
    },
    [setDialogOpen]
  )

  if (activeAddress) {
    button = <ConnectedWallet activeAddress={activeAddress} activeWalletAccounts={activeWalletAccounts ?? []} wallets={wallets} />
  } else {
    if (availableWalletIds.includes(WalletId.KMD)) {
      button = <ConnectWallet onConnect={refreshAvailableKmdWallets} />
    } else {
      button = <ConnectWallet />
    }
  }

  let walletProviders = <p>No wallet providers available</p>
  if (!activeAddress && availableWallets.length > 0) {
    walletProviders = (
      <>
        {availableWallets.map((wallet) =>
          wallet.id === WalletId.KMD ? (
            <KmdWalletConnectButton key={`wallet-${wallet.id}`} wallet={wallet} onConnect={selectWallet(wallet)} />
          ) : (
            <WalletConnectButton key={`wallet-${wallet.id}`} wallet={wallet} onConnect={selectWallet(wallet)} />
          )
        )}
        {networkConfig.id === localnetId && (
          <div className="flex flex-col gap-2">
            <span className="inline-flex justify-center text-sm">OR</span>
            <Button
              variant="link"
              onClick={() => {
                setDialogOpen(false)
                navigate({ pathname: Urls.Network.Fund.build({ networkId: networkConfig.id }), search: '?create=true' })
              }}
              className="mb-0.5 h-auto p-0"
            >
              Create a funded dev account
            </Button>
          </div>
        )}
      </>
    )
  }
  return (
    <>
      {button}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card" onOpenAutoFocus={preventDefault}>
          <Description hidden={true}>Choose a wallet provider</Description>
          <DialogHeader>
            <DialogTitle asChild>
              <h2>Wallet Providers</h2>
            </DialogTitle>
          </DialogHeader>
          <SmallSizeDialogBody className="flex flex-col space-y-4">{walletProviders}</SmallSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
