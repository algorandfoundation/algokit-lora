import { Path, PathValue, useFormContext } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { Input } from '@/features/common/components/input'
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

export const transactionTypeLabel = 'Transaction type'

export interface TransactionFormItemProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
  transactionType: algosdk.ABITransactionType
  launchModal: (component: JSX.Element | undefined) => void
}

// TODO: NC - Show the enter values in a readonly mode
// TODO: NC - Add the transaction type selector. Needs to be limited to the transactions that are available.
// TODO: NC - Make sure the form reset button clears the hidden field state
// TODO: NC - Properly handle decoding the value and sending the transaction
// TODO: NC - Make it look like the designs
// TODO: NC - Animation is a bit funky when closing the modal
// TODO: NC - Validation is incorrect for close account transaction building

interface TransactionBuilderProps<TSchema extends Record<string, unknown>> {
  transactionType: algosdk.ABITransactionType
  savedValues: Record<string, unknown>
  onAddTransaction: (value: PathValue<TSchema, Path<TSchema>>) => void
  onComplete: () => void
}

function TransactionBuilder<TSchema extends Record<string, unknown>>({
  transactionType,
  savedValues,
  onComplete,
  onAddTransaction,
}: TransactionBuilderProps<TSchema>) {
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
      onAddTransaction(JSON.stringify(values) as PathValue<TSchema, Path<TSchema>>) // TODO: NC - Handle bigint in json stringify
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
              firstValid: '' as unknown as undefined,
              lastValid: '' as unknown as undefined,
            },
            ...buildableTransaction.defaultValues,
            ...savedValues,
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
  disabled,
  placeholder,
  transactionType,
  launchModal,
  ...props
}: TransactionFormItemProps<TSchema>) {
  const { register, setValue, getValues, trigger } = useFormContext<TSchema>()

  const setTransaction = useCallback(
    async (value: PathValue<TSchema, Path<TSchema>>) => {
      setValue(field, value)
      trigger(field)
    },
    [field, setValue, trigger]
  )

  const closeModal = useCallback(() => {
    launchModal(undefined)
  }, [launchModal])

  const fieldValue = getValues(field)
  // TODO: NC - Make this better
  const savedValues = fieldValue ? JSON.parse(fieldValue.toString()) : undefined
  // TODO: NC - stringify is yuck
  const thign = savedValues ? Object.entries(savedValues).map(([key, value]) => ({ dt: key, dd: JSON.stringify(value) })) : []

  const buildTransaction = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      launchModal(
        <TransactionBuilder
          transactionType={transactionType}
          savedValues={savedValues}
          onComplete={closeModal}
          onAddTransaction={setTransaction}
        />
      )
    },
    [closeModal, launchModal, savedValues, setTransaction, transactionType]
  )

  return (
    <>
      {!savedValues && <Button onClick={buildTransaction}>Create</Button>}
      {savedValues && (
        <>
          <DescriptionList items={thign} />
          <Button onClick={buildTransaction}>Edit</Button>
        </>
      )}
      <FormItem {...props} field={field} disabled={disabled}>
        <Input
          id={field}
          autoComplete={'off'}
          type="hidden"
          {...register(field)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={field}
        />
      </FormItem>
    </>
  )
}
