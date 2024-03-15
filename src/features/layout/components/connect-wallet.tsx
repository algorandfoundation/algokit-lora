import { Button } from '@/features/common/components/button'
import { Input } from '@/features/common/components/input'
import { cn } from '@/features/common/utils'

export function ConnectWallet() {
  return (
    <div className={cn('flex gap-2')}>
      {/* TODO: add search icon */}
      <Input className={cn('w-96')} />
      <Button>Connect wallet</Button>
    </div>
  )
}
