import { cn } from '../utils'

type Props = {
  items: { dt: string; dd: string | JSX.Element[] | JSX.Element }[]
}

export function DescriptionList({ items }: Props) {
  return items.map((item, index) => (
    <dl className={cn('grid grid-cols-10')} key={index}>
      <dt className={cn('col-span-2')}>{item.dt}</dt>
      <dd className={cn('col-span-8')}>{item.dd}</dd>
    </dl>
  ))
}
