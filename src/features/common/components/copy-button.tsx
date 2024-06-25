import { CopyIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/features/common/utils'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

export const copyButtonLabel = 'Copy'

type Props = {
  value: string | (() => string)
  className?: string
}

export function CopyButton({ value, className }: Props) {
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(typeof value === 'function' ? value() : value)
    toast.info('Copied to clipboard')
  }, [value])

  return (
    <Button
      onClick={copyToClipboard}
      variant="no-style"
      size="icon"
      aria-label={copyButtonLabel}
      className={cn('align-middle ml-1 size-4 hover:text-foreground/60', className)}
    >
      <CopyIcon />
    </Button>
  )
}
