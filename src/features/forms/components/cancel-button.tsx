import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'

export interface CancelButton {
  className?: string
  onClick: () => void
}

export function CancelButton({ className, onClick }: CancelButton) {
  return (
    <Button type="button" variant="outline" className={cn(className)} onClick={onClick}>
      Cancel
    </Button>
  )
}
