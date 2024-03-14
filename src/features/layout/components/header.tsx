import { cn } from '@/features/primitive/utils'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { NetworkSelect } from './network-select'
import { ConnectWallet } from './connect-wallet'

export function Header() {
  return (
    <div className={cn('bg-secondary flex h-20 flex-row items-end justify-end gap-8 pb-2 pr-4')}>
      <ConnectWallet />
      <NetworkSelect />
      <ThemeToggle />
    </div>
  )
}
