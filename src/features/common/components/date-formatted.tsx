import { dateFormatter } from '@/utils/format'
import { cn } from '../utils'

type Props = {
  date: Date
  className?: string
  short?: boolean
}

export function DateFormatted({ date, className, short }: Props) {
  return (
    <span className={cn('tracking-tighter', className)}>
      {short ? dateFormatter.asShortDateTime(date) : dateFormatter.asLongDateTime(date)}
    </span>
  )
}
