import { cn } from '@/features/common/utils'
import { Search } from '@/features/search/components/search'
import { useNetworkConfig } from '@/features/settings/data'
import { ConnectWalletButton } from '@/features/wallet/components/connect-wallet-button'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  const networkConfig = useNetworkConfig()

  return (
    <header className={cn('bg-card text-card-foreground flex h-20 px-4 justify-start border-b', className)}>
      <div className={cn('flex items-baseline gap-4 mt-5')}>
        <span className="text-[26px]">[algokit]</span>
        <Search />
      </div>
      <div className={cn('flex items-center gap-4 ml-auto')}>
        <span className="flex">{networkConfig.name}</span>
        <ConnectWalletButton />
      </div>
    </header>
  )
}
