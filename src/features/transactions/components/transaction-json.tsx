import { JsonView } from '@/features/common/components/json-view'
import { cn } from '@/features/common/utils'

export type Props = {
  json: object
}

export function TransactionJson({ json }: Props) {
  return (
    <div className={cn('space-y-2')}>
      <h2 className={cn('text-xl font-bold')}>Transaction JSON</h2>
      <div className={cn('border-solid border-2 border-border h-96 grid')}>
        <JsonView json={json} />
      </div>
    </div>
  )
}
