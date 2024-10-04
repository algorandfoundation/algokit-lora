import { FormItemProps } from '@/features/forms/components/form-item'

export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {}

export function TransactionFormItem() {
  return <div>This argument is set by a transaction in group</div>
}
