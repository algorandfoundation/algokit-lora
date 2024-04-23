import { cn } from '@/features/common/utils'

type Props = {
  accountId: string
}

export function AccountLink({ accountId }: Props) {
  return (
    <a href="#" className={cn('text-primary underline')}>
      {accountId}
    </a>
  )
}
