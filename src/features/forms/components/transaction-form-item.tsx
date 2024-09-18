import { Path, PathValue, useFormContext } from 'react-hook-form'
import { FormItemProps } from '@/features/forms/components/form-item'
import { Button } from '@/features/common/components/button'
import { useCallback, useMemo, useState } from 'react'
import { Form } from './form'
import { TransactionBuilderFields } from '@/features/transaction-wizard/components/transaction-builder-fields'
import { FormActions } from './form-actions'
import { SubmitButton } from './submit-button'
import { DescriptionList } from '@/features/common/components/description-list'
import { accountCloseTransaction, paymentTransaction } from '@/features/transaction-wizard/data/payment-transactions'
import algosdk from 'algosdk'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { invariant } from '@/utils/invariant'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { HintText } from './hint-text'
import { useFormFieldError } from '../hooks/use-form-field-error'
import { asJson } from '@/utils/as-json'

export const transactionTypeLabel = 'Transaction type'

export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
  transactionType: algosdk.ABITransactionType
}

// TODO: NC - Show the enter values in a readonly mode
// TODO: NC - Add the transaction type selector. Needs to be limited to the transactions that are available.
// TODO: NC - Properly handle decoding the value and sending the transaction
// TODO: NC - Make it look like the designs
// TODO: NC - Validation is incorrect for close account transaction building
// TODO: NC - Handle readonly ABI methods <-- not related to transactions
// TODO: PD - think about calling a raw app (but actually an ABI app that ref another transaction).
//   In this case, we need the ability to construct the transaction group, add random transaction at random positions
interface TransactionBuilderProps<TSchema extends Record<string, unknown>> {
  data: {
    transactionType: algosdk.ABITransactionType
    fieldValue: PathValue<TSchema, Path<TSchema>>
  }
  onAddTransaction: (value: PathValue<TSchema, Path<TSchema>>) => void
  onComplete: () => void
}

function TransactionBuilder<TSchema extends Record<string, unknown>>({
  data,
  onComplete,
  onAddTransaction,
}: TransactionBuilderProps<TSchema>) {
  const { transactionType, fieldValue } = data
  const [selectedBuildableTransactionIndex, setSelectedBuildableTransactionIndex] = useState(0)

  const buildableTransactions = useMemo(() => {
    if (transactionType === algosdk.ABITransactionType.pay) {
      return [paymentTransaction, accountCloseTransaction]
    }
    return []
  }, [transactionType])

  invariant(selectedBuildableTransactionIndex < buildableTransactions.length, 'Invalid transaction type index')

  const buildableTransaction = buildableTransactions[selectedBuildableTransactionIndex]

  const addTransaction = useCallback(
    async (values: Parameters<typeof buildableTransaction.createTransaction>[0]) => {
      onAddTransaction(values as PathValue<TSchema, Path<TSchema>>)
    },
    [buildableTransaction, onAddTransaction]
  )

  const changeSelectedBuildableTransaction = useCallback(async (value: string) => {
    setSelectedBuildableTransactionIndex(Number(value))
  }, [])

  return (
    <div>
      <div className={cn('flex w-72 flex-col mb-4')}>
        <Label htmlFor="transaction-type" className={cn('ml-0.5 mb-2')}>
          {transactionTypeLabel}
        </Label>
        <Select onValueChange={changeSelectedBuildableTransaction} value={selectedBuildableTransactionIndex.toString()}>
          <SelectTrigger id="transaction-type">
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent className={cn('bg-card text-card-foreground')}>
            {buildableTransactions.map((transaction, i) => (
              <SelectItem key={i} value={i.toString()}>
                {transaction.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Form
        schema={buildableTransaction.schema}
        defaultValues={
          {
            // sender: defaultSender, // TODO: NC - Make this work
            sender: '',
            fee: {
              setAutomatically: true,
              value: '' as unknown as undefined,
            },
            validRounds: {
              setAutomatically: true,
              firstValid: '' as unknown as undefined, // TODO: NC - Do we need this anymore.
              lastValid: '' as unknown as undefined,
            },
            ...buildableTransaction.defaultValues,
            ...(fieldValue ?? undefined),
          } as Parameters<typeof buildableTransaction.createTransaction>[0]
        }
        onSubmit={addTransaction}
        onSuccess={onComplete}
        resetOnSuccess={true}
        formAction={(ctx, resetLocalState) => (
          <FormActions
            key={buildableTransaction.label}
            onInit={() => {
              resetLocalState()
              ctx.clearErrors()
            }}
          >
            <Button type="button" variant="outline" onClick={onComplete}>
              Cancel
            </Button>
            <SubmitButton>Save</SubmitButton>
          </FormActions>
        )}
      >
        {(helper) => <TransactionBuilderFields helper={helper} transaction={buildableTransaction} />}
      </Form>
    </div>
  )
}

export function TransactionFormItem<TSchema extends Record<string, unknown> = Record<string, unknown>>({
  field,
  transactionType,
  helpText,
}: TransactionFormItemProps<TSchema>) {
  const { setValue, watch, trigger } = useFormContext<TSchema>()
  const error = useFormFieldError(field)

  const fieldValue = watch(field)

  const { open: openTransactionBuilderDialog, dialog: transactionBuilderDialog } = useDialogForm({
    dialogHeader: 'Build Transaction',
    dialogBody: (
      props: DialogBodyProps<
        { transactionType: algosdk.ABITransactionType; fieldValue: PathValue<TSchema, Path<TSchema>> },
        PathValue<TSchema, Path<TSchema>>
      >
    ) => (
      <TransactionBuilder
        data={{ transactionType: props.data.transactionType, fieldValue: props.data.fieldValue }}
        onComplete={props.onCancel}
        onAddTransaction={props.onSubmit}
      />
    ),
  })

  const openDialog = useCallback(async () => {
    const transactionParams = await openTransactionBuilderDialog({
      transactionType,
      fieldValue,
    })
    if (transactionParams) {
      setValue(field, transactionParams)
      await trigger(field)
    }
  }, [openTransactionBuilderDialog, transactionType, fieldValue, setValue, field, trigger])

  return (
    <>
      {!fieldValue && (
        <Button type="button" onClick={openDialog}>
          Create
        </Button>
      )}
      {fieldValue && (
        <>
          {/* TODO: NC - Remove asJson */}
          <DescriptionList items={Object.entries(fieldValue).map(([key, value]) => ({ dt: key, dd: asJson(value) }))} />
          <Button type="button" onClick={openDialog}>
            Edit
          </Button>
        </>
      )}
      <div>{transactionBuilderDialog}</div>
      <HintText errorText={error?.message} helpText={helpText} />
    </>
  )
}
