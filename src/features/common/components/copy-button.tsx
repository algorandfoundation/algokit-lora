import { CopyIcon } from 'lucide-react'
import { Button } from './button'

type Props = {
  onClick: () => void
}

export const copyButtonLabel = 'Copy'

export function CopyButton({ onClick }: Props) {
  return (
    <Button onClick={onClick} variant="no-style" size="sm-icon" aria-label={copyButtonLabel} className="hover:bg-transparent">
      <CopyIcon className="size-4" />
    </Button>
  )
}
