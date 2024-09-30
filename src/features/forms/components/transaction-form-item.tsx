import algosdk from 'algosdk'
import { useFormContext } from 'react-hook-form'
import { FormItemProps } from '@/features/forms/components/form-item'
import { Button } from '@/features/common/components/button'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { HintText } from './hint-text'
import { useFormFieldError } from '../hooks/use-form-field-error'
import { BuildTransactionResult } from '@/features/transaction-wizard/models'
import { asDescriptionListItems } from '@/features/transaction-wizard/mappers'

export const transactionTypeLabel = 'Transaction type'

export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  transactionType: algosdk.ABITransactionType
  placeholder?: string
  onEdit: () => void
}

// TODO: NC - Make it look like the designs
// TODO: NC - When setting a fee (or round range), then resetting it back the previously set fee is still set.
export function TransactionFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  transactionType,
  field,
  helpText,
  onEdit,
}: TransactionFormItemProps<TSchema>) {
  const { watch } = useFormContext<TSchema>()
  const error = useFormFieldError(field)
  const fieldValue = watch(field) as BuildTransactionResult | undefined

  const transactionFields = useMemo(() => {
    if (fieldValue) {
      return asDescriptionListItems(fieldValue)
    } else {
      return []
    }
  }, [fieldValue])

  return (
    <>
      {transactionFields.length > 0 && <DescriptionList items={transactionFields} />}
      <div className="flex">
        <Button
          type="button"
          onClick={() => onEdit()}
          disabled={transactionType === algosdk.ABITransactionType.appl}
          disabledReason="Nested app call is not supported yet."
        >
          {transactionFields.length === 0 ? 'Add' : 'Edit'}
        </Button>
      </div>
      <HintText errorText={error?.message} helpText={helpText} />
    </>
  )
}
