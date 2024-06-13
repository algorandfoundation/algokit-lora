import { dateFormatter } from '@/utils/format'

type Props = {
  date: Date
}

export function DateFormatted({ date }: Props) {
  return <span className="tracking-tighter">{dateFormatter.asLongDateTime(date)}</span>
}
