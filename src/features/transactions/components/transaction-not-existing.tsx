import { cn } from '@/features/common/utils'

export function TransactionNotExist() {
  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>Transaction does not exist</h1>
    </div>
  )
}
