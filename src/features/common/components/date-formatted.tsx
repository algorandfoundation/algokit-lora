import { dateFormatter } from '@/utils/format'
import { cn } from '../utils'

type Props = {
  date: Date
  className?: string
}

export function DateFormatted({ date, className }: Props) {
  return <span className={cn('tracking-tighter', className)}>{dateFormatter.asLongDateTime(date)}</span>
}
