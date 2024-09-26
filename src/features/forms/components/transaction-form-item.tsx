import { Path, PathValue, useFormContext } from 'react-hook-form'
import { FormItemProps } from '@/features/forms/components/form-item'
import { Button } from '@/features/common/components/button'
import { useCallback, useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import algosdk from 'algosdk'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { HintText } from './hint-text'
import { useFormFieldError } from '../hooks/use-form-field-error'
import { BuildTransactionResult } from '@/features/transaction-wizard/models'
import { TransactionBuilder } from '@/features/transaction-wizard/components/transaction-builder'
import { TransactionBuilderMode } from '@/features/transaction-wizard/data'
import { asDescriptionListItems } from '@/features/transaction-wizard/mappers'

export const transactionTypeLabel = 'Transaction type'

export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
  transactionType: algosdk.ABITransactionType
}

// TODO: NC - Add the transaction type selector. Needs to be limited to the transactions that are available.
// TODO: NC - Properly handle decoding the value and sending the transaction
// TODO: NC - Make it look like the designs
// TODO: NC - Validation is incorrect for close account transaction building
// TODO: NC - Handle readonly ABI methods <-- not related to transactions
// TODO: NC - When setting a fee (or round range), then resetting it back the previously set fee is still set.
export function TransactionFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  transactionType,
  helpText,
}: TransactionFormItemProps<TSchema>) {
  const { setValue, watch, trigger } = useFormContext<TSchema>()
  const error = useFormFieldError(field)
  const fieldValue = watch(field) as BuildTransactionResult | undefined

  const { open: openTransactionBuilderDialog, dialog: transactionBuilderDialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (
      props: DialogBodyProps<
        { mode: TransactionBuilderMode; transactionType: algosdk.ABITransactionType; transaction?: BuildTransactionResult },
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        mode={props.data.mode}
        transactionType={mapToTransactionType(props.data.transactionType)}
        transaction={props.data.transaction}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
      />
    ),
  })

  const openDialog = useCallback(
    async (mode: TransactionBuilderMode) => {
      const result = await openTransactionBuilderDialog({
        mode,
        transactionType,
        transaction: fieldValue,
      })
      if (result) {
        setValue(field, result as PathValue<TSchema, Path<TSchema>>)
        await trigger(field)
      }
    },
    [openTransactionBuilderDialog, transactionType, fieldValue, setValue, field, trigger]
  )

  const transactionFields = useMemo(() => {
    if (fieldValue) {
      return asDescriptionListItems(fieldValue)
    } else {
      return []
    }
  }, [fieldValue])

  return (
    <>
      {transactionFields.length === 0 && (
        <Button type="button" onClick={() => openDialog(TransactionBuilderMode.Create)}>
          Create
        </Button>
      )}
      {transactionFields.length > 0 && (
        <>
          <DescriptionList items={transactionFields} />
          <Button type="button" onClick={() => openDialog(TransactionBuilderMode.Edit)}>
            Edit
          </Button>
        </>
      )}
      <div>{transactionBuilderDialog}</div>
      <HintText errorText={error?.message} helpText={helpText} />
    </>
  )
}

function mapToTransactionType(type: algosdk.ABITransactionType): algosdk.TransactionType | undefined {
  switch (type) {
    case algosdk.ABITransactionType.pay:
      return algosdk.TransactionType.pay
    case algosdk.ABITransactionType.keyreg:
      return algosdk.TransactionType.keyreg
    case algosdk.ABITransactionType.acfg:
      return algosdk.TransactionType.acfg
    case algosdk.ABITransactionType.axfer:
      return algosdk.TransactionType.axfer
    case algosdk.ABITransactionType.afrz:
      return algosdk.TransactionType.afrz
    case algosdk.ABITransactionType.appl:
      return algosdk.TransactionType.appl
    default:
      return undefined
  }
}
