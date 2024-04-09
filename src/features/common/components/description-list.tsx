import { cn } from '../utils'

type Props = {
  items: { dt: string; dd: string | JSX.Element }[]
}

export function DescriptionList({ items }: Props) {
  return (
    <div className={cn('grid grid-cols-[minmax(min-content,auto)_1fr] gap-x-4')}>
      {items.map((item, index) => (
        <dl key={index} className={cn('grid grid-cols-subgrid col-span-2')}>
          <dt>{item.dt}</dt>
          <dd>{item.dd}</dd>
        </dl>
      ))}
    </div>
  )
}
