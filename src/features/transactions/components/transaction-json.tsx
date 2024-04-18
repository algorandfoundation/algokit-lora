import { cn } from '@/features/common/utils'

export type Props = {
  json: string
}

export function TransactionJson({ json }: Props) {
  return (
    <div className={cn('space-y-2')}>
      <h2 className={cn('text-xl font-bold')}>Transction JSON</h2>
      <div className={cn('border-solid border-2 border-border h-96 grid')}>
        <pre className={cn('overflow-scroll p-4')}>{json}</pre>
      </div>
    </div>
  )
}
