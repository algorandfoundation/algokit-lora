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
    <div className={cn('grid grid-cols-[minmax(min-content,auto)_1fr] min-w-60 gap-y-1.5')}>
      {items.map((item, index) => (
        <dl key={index} className={cn('grid grid-cols-subgrid col-span-2 gap-4')}>
          <dt className={cn('font-medium', dtClassName)}>{item.dt}</dt>
          <dd className={cn('whitespace-normal wrap-break-word overflow-hidden', 'min-w-0')}>
            {typeof item.dd === 'bigint' ? item.dd.toString() : item.dd}
          </dd>
        </dl>
      ))}
    </div>
  )
}
