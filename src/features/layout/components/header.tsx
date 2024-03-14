import { cn } from '@/features/primitive/utils'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { NetworkSelect } from './network-select'
import { ConnectWallet } from './connect-wallet'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  return (
    <div className={cn('bg-card flex h-20 flex-row items-end justify-end gap-8 pb-2 pr-4', className)}>
      <ConnectWallet />
      <NetworkSelect />
      <ThemeToggle />
    </div>
  )
}
