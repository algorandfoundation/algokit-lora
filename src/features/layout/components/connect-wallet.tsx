import { Button } from '@/features/primitive/components/button'
import { Input } from '@/features/primitive/components/input'
import { cn } from '@/features/primitive/utils'

export function ConnectWallet() {
  return (
    <div className={cn('flex gap-2')}>
      {/* TODO: add search icon */}
      <Input className={cn('w-96')} />
      <Button>Connect wallet</Button>
    </div>
  )
}
