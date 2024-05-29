import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/features/common/components/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'

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
            <span>{provider.metadata.name}</span>
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
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <h1 className={cn('text-2xl text-primary font-bold')}>Select Algorand Wallet Provider</h1>
          </DialogHeader>
          <InternalDialogContent />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const ellipseAddress = (address = '', width = 6) => {
  return address ? `${address.slice(0, width)}...${address.slice(-width)}` : address
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={cn('mt-1')}>
        <Button variant="default">
          {activeProvider && (
            <img
              src={activeProvider.metadata.icon}
              alt={`${activeProvider.metadata.name} icon`}
              className={cn('h-auto w-4 rounded object-contain mr-2')}
            />
          )}
          <abbr title={activeAddress} className="font-normal no-underline">
            {ellipseAddress(activeAddress)}
          </abbr>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={disconnectWallet}>Disconnect</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
