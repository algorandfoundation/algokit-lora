import { cn } from '../utils'

export type DescriptionListItems = {
  dt: string
  dd: string | number | bigint | boolean | React.JSX.Element[] | React.JSX.Element | undefined
}[]

type Props = {
  items: DescriptionListItems
  dtClassName?: string
}

export function DescriptionList({ items, dtClassName }: Props) {
  return (
    <div className={cn('grid grid-cols-[minmax(min-content,auto)_1fr] gap-x-4 gap-y-1.5')}>
      {items.map((item, index) => (
        <dl key={index} className={cn('grid grid-cols-subgrid col-span-2')}>
          <dt className={cn(dtClassName)}>{item.dt}</dt>
          <dd className={cn('overflow-ellipsis whitespace-normal overflow-hidden')}>
            {typeof item.dd === 'bigint' ? item.dd.toString() : item.dd}
          </dd>
        </dl>
      ))}
    </div>
  )
}
