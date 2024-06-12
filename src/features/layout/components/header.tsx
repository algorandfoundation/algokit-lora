import { cn } from '@/features/common/utils'
import { ThemeToggle } from '@/features/settings/components/theme-toggle'
import { Search } from '@/features/search/components/search'
import { useNetworkConfig } from '@/features/settings/data'
import { ConnectWalletButton } from '@/features/wallet/components/connect-wallet-button'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  const networkConfig = useNetworkConfig()

  return (
    <header className={cn('bg-card flex h-20 flex-row px-4 items-center justify-start', className)}>
      <div className={cn('flex flex-row mr-4')}>
        <span className="text-2xl">[algokit]</span>
      </div>
      <div className={cn('flex flex-row mr-4')}>
        <Search />
      </div>
      <div className={cn('flex flex-row items-center justify-end gap-2 ml-auto')}>
        <span className="flex flex-row">{networkConfig.name}</span>
        <ConnectWalletButton />
        <ThemeToggle />
      </div>
    </header>
  )
}
