import { cn } from '@/features/common/utils'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type Props = {
  transaction: TransactionResult
}

export function TransactionJson({ transaction }: Props) {
  return (
    <div className={cn('space-y-2')}>
      <h2 className={cn('text-xl font-bold')}>Transction JSON</h2>
      <div className={cn('border-solid border-2 border-border h-96 grid')}>
        <pre className={cn('overflow-scroll p-4')}>{JSON.stringify(transaction, null, 4)}</pre>
      </div>
    </div>
  )
}
