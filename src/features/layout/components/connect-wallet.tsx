import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { useWallet } from '@txnlab/use-wallet'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/features/common/components/dialog'

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
