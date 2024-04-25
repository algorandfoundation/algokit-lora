import { cn } from '@/features/common/utils'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { NetworkSelect } from './network-select'
import { ConnectWallet } from './connect-wallet'
import { Search } from '@/features/search/components/search'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  return (
    <div className={cn('bg-card flex h-20 flex-row justify-between px-5 pt-4 gap-5', className)}>
      <div className={cn('flex flex-row items-baseline justify-start mt-1')}>
        <Search />
      </div>
      <div className={cn('flex flex-row items-start justify-end gap-2')}>
        <NetworkSelect />
        <ConnectWallet />
        <ThemeToggle />
      </div>
    </div>
  )
}
