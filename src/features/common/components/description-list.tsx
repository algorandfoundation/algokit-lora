import { cn } from '../utils'

export type DescriptionListItems = { dt: string; dd: string | number | JSX.Element[] | JSX.Element | undefined }[]

type Props = {
  items: DescriptionListItems
}

export function DescriptionList({ items }: Props) {
  return (
    <div className={cn('grid grid-cols-[minmax(min-content,auto)_1fr] gap-x-4 gap-y-1.5')}>
      {items.map((item, index) => (
        <dl key={index} className={cn('grid grid-cols-subgrid col-span-2')}>
          <dt>{item.dt}</dt>
          <dd className={cn('overflow-ellipsis whitespace-normal overflow-hidden')}>{item.dd}</dd>
        </dl>
      ))}
    </div>
  )
}
