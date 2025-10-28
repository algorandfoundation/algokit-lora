import { RefreshCw } from 'lucide-react'
import { Button } from './button'

type Props = {
  onClick: () => void
}

export const refreshButtonLabel = 'Refresh'

export function RefreshButton({ onClick }: Props) {
  return (
    <Button onClick={onClick} variant="outline" size="icon" aria-label={refreshButtonLabel} className="animate-in fade-in-0 ml-auto">
      <span className="sr-only">{refreshButtonLabel}</span>
      <RefreshCw className="size-[1.2rem]" />
    </Button>
  )
}
