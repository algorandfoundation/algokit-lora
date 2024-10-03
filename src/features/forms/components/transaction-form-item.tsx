import algosdk from 'algosdk'
import { FormItemProps } from '@/features/forms/components/form-item'

// TODO: PD - prob don't need this, just here to not having to convert app-call.ts to tsx
export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  transactionType: algosdk.ABITransactionType
}

export function TransactionFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  transactionType,
}: TransactionFormItemProps<TSchema>) {
  return <div>Txn arg: {transactionType}</div>
}
