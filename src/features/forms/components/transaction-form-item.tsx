import { useFormContext } from 'react-hook-form'
import { FormItemProps } from '@/features/forms/components/form-item'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { HintText } from './hint-text'
import { useFormFieldError } from '../hooks/use-form-field-error'
import { BuildableTransactionType, BuildTransactionResult, PlaceholderTransaction } from '@/features/transaction-wizard/models'
import { asDescriptionListItems } from '@/features/transaction-wizard/mappers'

export const transactionTypeLabel = 'Transaction type'

export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {}

export function TransactionFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  helpText,
}: TransactionFormItemProps<TSchema>) {
  const { watch } = useFormContext<TSchema>()
  const error = useFormFieldError(field)
  const fieldValue = watch(field) as BuildTransactionResult | PlaceholderTransaction | undefined

  const transactionFields = useMemo(() => {
    if (fieldValue && fieldValue.type !== BuildableTransactionType.Placeholder) {
      return asDescriptionListItems(fieldValue)
    } else {
      return []
    }
  }, [fieldValue])

  return (
    <>
      {transactionFields.length > 0 && (
        <div className="relative">
          <DescriptionList items={transactionFields} dtClassName="w-24 truncate" />
        </div>
      )}
      <div>
        <HintText errorText={error?.message} helpText={helpText} />
      </div>
    </>
  )
}
