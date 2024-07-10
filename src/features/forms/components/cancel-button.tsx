import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'

export interface SubmitButtonProps {
  className?: string
  onClick: () => void
}

export function CancelButton({ className, onClick }: SubmitButtonProps) {
  return (
    <Button type="button" variant={'outline'} className={cn('w-28', className)} onClick={onClick}>
      Cancel
    </Button>
  )
}
