import { cn } from '@/features/common/utils'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { ConnectWallet } from './connect-wallet'
import { Search } from '@/features/search/components/search'
import { useNetworkConfig } from '@/features/settings/data'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  const networkConfig = useNetworkConfig()

  return (
    <div className={cn('bg-card flex h-20 flex-row justify-between px-5 pt-4 gap-5', className)}>
      <div className={cn('flex flex-row items-baseline justify-start mt-1')}>
        <Search />
      </div>
      <div className={cn('flex flex-row items-center justify-end gap-2')}>
        <label>Network: {networkConfig.name}</label>
        <ConnectWallet />
        <ThemeToggle />
      </div>
    </div>
  )
}
