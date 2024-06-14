import { CopyIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/features/common/utils'

type Props = {
  onClick: () => void
  className?: string
}

export const copyButtonLabel = 'Copy'

export function CopyButton({ onClick, className }: Props) {
  return (
    <Button onClick={onClick} variant="no-style" size="icon" aria-label={copyButtonLabel} className={cn('size-4', className)}>
      <CopyIcon size={'1rem'} />
    </Button>
  )
}
