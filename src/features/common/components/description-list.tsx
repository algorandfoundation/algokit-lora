import { cn } from '../utils'

type Props = {
  items: { dt: string; dd: string | number | JSX.Element[] | JSX.Element | undefined }[]
}

export function DescriptionList({ items }: Props) {
  return (
    <div className={cn('grid grid-cols-[minmax(min-content,auto)_1fr] gap-x-4 gap-y-1.5')}>
      {items.map((item, index) => (
        <dl key={index} className={cn('grid grid-cols-subgrid col-span-2')}>
          <dt className="flex items-center">{item.dt}</dt>
          <dd className="flex items-center">{item.dd}</dd>
        </dl>
      ))}
    </div>
  )
}
