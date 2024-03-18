import { cn } from '@/features/common/utils'
import { TransactionModel } from '../models/models'

export type Props = {
  transaction: TransactionModel
}

export function TransactionJson({ transaction }: Props) {
  return (
    <div className={cn('space-y-2')}>
      <h2 className={cn('text-xl font-bold')}>Transction JSON</h2>
      <div className={cn('border-solid border-2 border-border h-96 p-4 overflow-y-scroll')}>
        <pre>{JSON.stringify(JSON.parse(transaction.json), null, 4)}</pre>
      </div>
    </div>
  )
}
