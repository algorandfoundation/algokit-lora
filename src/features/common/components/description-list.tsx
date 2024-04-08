import { cn } from '../utils'

type Props = {
  items: { dt: string; dd: string | JSX.Element }[]
}

export function DescriptionList({ items }: Props) {
  return items.map((item, index) => (
    <dl className={cn('grid grid-cols-8')} key={index}>
      <dt>{item.dt}</dt>
      <dd className={cn('col-span-7')}>{item.dd}</dd>
    </dl>
  ))
}
