import { Button } from '@/features/common/components/button'
import { Provider } from '@txnlab/use-wallet'
import { cn } from '@/features/common/utils'
import { localnetConfig } from '@/features/settings/data'
import { Wallet } from 'lucide-react'

type Props = {
  provider: Provider
  onConnect: () => Promise<void>
  className?: string
}

export function ProviderConnectButton({ provider, onConnect, className }: Props) {
  return (
    <Button key={`provider-${provider.metadata.id}`} onClick={onConnect} className={className}>
      {localnetConfig.walletProviders.includes(provider.metadata.id) ? (
        <Wallet className={cn('size-6 rounded object-contain mr-2')} />
      ) : (
        <img src={provider.metadata.icon} alt={`${provider.metadata.name} icon`} className="h-auto w-6 rounded object-contain" />
      )}
      <span className="ml-1">Connect {provider.metadata.name}</span>
    </Button>
  )
}
