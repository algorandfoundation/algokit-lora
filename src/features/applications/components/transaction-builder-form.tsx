import { AppCallTransactionBuilder } from '@/features/transaction-wizard/components/app-call-transaction-builder'
import algosdk from 'algosdk'

type Props = {
  onSubmit: (transactions: algosdk.Transaction[]) => void
  onCancel: () => void
}

// TODO: PD - this should be gone
export function TransactionBuilderForm({ onSubmit, onCancel }: Props) {
  return <AppCallTransactionBuilder onSubmit={onSubmit} onCancel={onCancel} />
}
