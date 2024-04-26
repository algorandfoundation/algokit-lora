import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'

export function ConnectWallet() {
  return (
    <div className={cn('mt-1')}>
      <Button>Connect wallet</Button>
    </div>
  )
}
