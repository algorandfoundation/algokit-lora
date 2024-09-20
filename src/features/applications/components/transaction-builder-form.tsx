import { AppCallTransactionBuilder } from '@/features/transaction-wizard/components/app-call-transaction-builder'
import { AppCallTransactionBuilderResult } from '@/features/transaction-wizard/models'

type Props = {
  onSubmit: (transaction: AppCallTransactionBuilderResult) => void
  onCancel: () => void
}

// TODO: PD - this should be gone
export function TransactionBuilderForm({ onSubmit, onCancel }: Props) {
  return <AppCallTransactionBuilder onSubmit={onSubmit} onCancel={onCancel} />
}
