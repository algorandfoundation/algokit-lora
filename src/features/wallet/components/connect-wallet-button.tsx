import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Provider, useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogContent, DialogHeader } from '@/features/common/components/dialog'
import { ellipseAddress } from '@/utils/ellipse-address'
import { buttonVariants } from '@/features/common/components/button'
import { AccountLink } from '@/features/accounts/components/account-link'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/features/common/components/hover-card'
import { Loader2 as Loader } from 'lucide-react'
import { useNetworkConfig } from '@/features/settings/data'
import { useCallback, useMemo, useState } from 'react'
import { asError } from '@/utils/error'
import { toast } from 'react-toastify'

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
    []
  )

  return (
    <>
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
    </>
  )
}

type ConnectedWalletProps = {
  activeAddress: string
  providers: Provider[] | null
}

export function ConnectedWallet({ activeAddress, providers }: ConnectedWalletProps) {
  const activeProvider = useMemo(() => providers?.find((p) => p.isActive), [providers])

  const disconnectWallet = useCallback(async () => {
    if (activeProvider) {
      await activeProvider.disconnect()
    } else {
      // Fallback cleanup mechanism in the rare case of provider configuration and state being out of sync.
      // TODO: NC - We can probably use the clearAccounts function instead of this
      localStorage.removeItem('txnlab-use-wallet')
      window.location.reload()
    }
  }, [activeProvider])

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <AccountLink address={activeAddress} className={cn(buttonVariants({ variant: 'default' }), 'w-32')}>
          {activeProvider && (
            <img
              src={activeProvider.metadata.icon}
              alt={`${activeProvider.metadata.name} icon`}
              className={cn('h-auto w-4 rounded object-contain mr-2')}
            />
          )}
          <abbr title={activeAddress} className="no-underline">
            {ellipseAddress(activeAddress)}
          </abbr>
        </AccountLink>
      </HoverCardTrigger>
      <HoverCardContent align="center" className="w-36 border border-input bg-card p-2 text-card-foreground">
        <Button variant="default" onClick={disconnectWallet} className="w-full p-4">
          Disconnect
        </Button>
      </HoverCardContent>
    </HoverCard>
  )
}

export function ConnectWalletButton() {
  const { activeAddress, providers, isReady } = useWallet()

  if (!isReady) {
    return (
      <Button className="w-32">
        <Loader className="size-5 animate-spin" />
      </Button>
    )
  }

  if (activeAddress) {
    return <ConnectedWallet activeAddress={activeAddress} providers={providers} />
  }

  return <ConnectWallet activeAddress={activeAddress} providers={providers} />
}
