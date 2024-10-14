import { PlusCircle } from 'lucide-react'
import { BuildTransactionResult, PlaceholderTransaction } from '@/features/transaction-wizard/models'

export function PlaceholderDescription({
  transaction,
  transactionGroup,
}: {
  transaction: PlaceholderTransaction
  transactionGroup: (PlaceholderTransaction | BuildTransactionResult)[]
}) {
  const indexes = transaction.argumentForMethodCalls.map((tid) => transactionGroup.findIndex((t) => t.id === tid) + 1)

  return (
    <div className="flex min-h-8 items-center gap-1.5">
      <PlusCircle size={16} />
      <span>Build argument for transactions {indexes.join(', ')}</span>
    </div>
  )
}
