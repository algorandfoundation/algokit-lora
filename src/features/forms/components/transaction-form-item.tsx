import { FormItemProps } from '@/features/forms/components/form-item'
import { HintText } from './hint-text'
import { useFormFieldError } from '../hooks/use-form-field-error'

export const transactionTypeLabel = 'Transaction type'

export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {}

export function TransactionFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  helpText,
}: TransactionFormItemProps<TSchema>) {
  const error = useFormFieldError(field)

  return (
    <>
      <div>
        <HintText errorText={error?.message} helpText={helpText} />
      </div>
    </>
  )
}
