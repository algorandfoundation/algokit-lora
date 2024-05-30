import { cn } from '@/features/common/utils'
import { ThemeToggle } from '@/features/settings/components/theme-toggle'
import { Search } from '@/features/search/components/search'
import { useNetworkConfig } from '@/features/settings/data'
import { WalletConnect } from '../../wallet/components/wallet-providers'

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
        <WalletConnect />
        <ThemeToggle />
      </div>
    </div>
  )
}
