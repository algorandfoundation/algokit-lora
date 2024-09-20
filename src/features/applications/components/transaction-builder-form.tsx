import { AppCallTransactionBuilderForm } from '@/features/transaction-wizard/components/app-call-transaction-builder-form'
import { AppCallTransactionBuilderResult } from '@/features/transaction-wizard/models'

type Props = {
  onSubmit: (transaction: AppCallTransactionBuilderResult) => void
  onCancel: () => void
}

export function TransactionBuilderForm({ onSubmit, onCancel }: Props) {
  return <AppCallTransactionBuilderForm onSubmit={onSubmit} onCancel={onCancel} />
}
