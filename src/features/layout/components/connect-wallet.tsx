import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'

export function ConnectWallet() {
  return (
    <div className={cn('flex gap-2')}>
      <Button>Connect wallet</Button>
    </div>
  )
}
