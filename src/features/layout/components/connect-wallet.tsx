import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/features/common/components/dialog'
import { ellipseAddress } from '@/utils/ellipse-address'
import { buttonVariants } from '@/features/common/components/button'
import { AccountLink } from '@/features/accounts/components/account-link'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/features/common/components/hover-card'

function InternalDialogContent() {
  const { activeAddress, providers } = useWallet()
  return (
    <div className="flex flex-col space-y-2">
      {!activeAddress &&
        providers?.map((provider) => (
          <Button
            key={`provider-${provider.metadata.id}`}
            onClick={async () => {
              if (provider.isConnected) {
                provider.setActiveProvider()
              } else {
                await provider.connect()
              }
              DialogClose
            }}
          >
            <img src={provider.metadata.icon} alt={`${provider.metadata.name} icon`} className="h-auto w-6 rounded object-contain" />
            <span className="ml-1">{provider.metadata.name}</span>
          </Button>
        ))}
    </div>
  )
}

export function ConnectWallet() {
  return (
    <div className={cn('mt-1')}>
      <Dialog>
        <DialogTrigger>
          <Button>connect wallet</Button>
        </DialogTrigger>
        <DialogContent className="w-[500px] bg-card">
          <DialogHeader>
            <h2 className={cn('text-2xl text-primary font-bold')}>Select Algorand Wallet Provider</h2>
          </DialogHeader>
          <InternalDialogContent />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ConnectWalletButton() {
  const { activeAddress, providers, isReady } = useWallet()
  const activeProvider = providers?.find((p) => p.isActive)

  const disconnectWallet = () => {
    if (providers) {
      const activeProvider = providers.find((p) => p.isActive)
      if (activeProvider) {
        activeProvider.disconnect()
      } else {
        // Required for logout/cleanup of inactive providers
        // For instance, when you login to localnet wallet and switch network
        // to testnet/mainnet or vice verse.
        localStorage.removeItem('txnlab-use-wallet')
        window.location.reload()
      }
    }
  }

  if (!isReady) {
    return <></>
  }
  return !activeAddress ? (
    <ConnectWallet />
  ) : (
    <div>
      <HoverCard openDelay={100}>
        <HoverCardTrigger>
          <AccountLink address={activeAddress} className={buttonVariants({ variant: 'default' })}>
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
    </div>
  )
}
