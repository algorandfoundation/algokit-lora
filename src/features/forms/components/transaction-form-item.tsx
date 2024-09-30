import algosdk from 'algosdk'
import { Path, PathValue, useFormContext } from 'react-hook-form'
import { FormItemProps } from '@/features/forms/components/form-item'
import { Button } from '@/features/common/components/button'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { HintText } from './hint-text'
import { useFormFieldError } from '../hooks/use-form-field-error'
import { BuildTransactionResult } from '@/features/transaction-wizard/models'
import { asDescriptionListItems } from '@/features/transaction-wizard/mappers'
import { EllipsisVertical, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'

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
  const { watch, setValue } = useFormContext<TSchema>()
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
      {transactionFields.length > 0 && (
        <div className="relative">
          <DescriptionList items={transactionFields} />
          <div className="absolute right-0 top-0 w-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center justify-center py-4">
                <EllipsisVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="left">
                <DropdownMenuItem onClick={() => onEdit()}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setValue(field, undefined as PathValue<TSchema, Path<TSchema>>)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      {transactionFields.length === 0 && (
        <div className="absolute right-0 top-6">
          <Button
            variant="outline-secondary"
            type="button"
            onClick={() => onEdit()}
            disabled={transactionType === algosdk.ABITransactionType.appl}
            disabledReason="App call transaction arguments are currently not supported"
            icon={<Plus size={16} />}
          >
            Add Transaction
          </Button>
        </div>
      )}
      <div>
        <HintText errorText={error?.message} helpText={helpText} />
      </div>
    </>
  )
}
