import { RefreshCw } from 'lucide-react'
import { Button } from './button'

type Props = {
  onClick: () => void
}

const refreshButtonLabel = 'Refresh'

export function RefreshButton({ onClick }: Props) {
  return (
    <Button onClick={onClick} variant="ghost" size="sm" aria-label={refreshButtonLabel} className="ml-auto">
      <RefreshCw className="size-[1.2rem]" />
      <span className="sr-only">{refreshButtonLabel}</span>
    </Button>
  )
}
