import algosdk from 'algosdk'
import { numberSchema } from '@/features/forms/data/common'
import {
  commonSchema,
  onCompleteOptionsForAppCreate,
  onCompleteForAppCreateFieldSchema,
  optionalAddressFieldSchema,
} from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { BuildApplicationCreateTransactionResult, BuildableTransactionType } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { asAddressOrNfd } from '../mappers/as-address-or-nfd'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'
import { resolveSenderAddress } from '../utils/resolve-sender-address'

const formData = zfd.formData({
  ...commonSchema,
  sender: optionalAddressFieldSchema,
  ...onCompleteForAppCreateFieldSchema,
  approvalProgram: zfd.text(z.string({ required_error: 'Required', invalid_type_error: 'Required' })),
  clearStateProgram: zfd.text(z.string({ required_error: 'Required', invalid_type_error: 'Required' })),
  extraProgramPages: numberSchema(z.number().min(0).max(3).optional()),
  globalInts: numberSchema(z.number().min(0).optional()),
  globalByteSlices: numberSchema(z.number().min(0).optional()),
  localInts: numberSchema(z.number().min(0).optional()),
  localByteSlices: numberSchema(z.number().min(0).optional()),
  args: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
})

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildApplicationCreateTransactionResult
  activeAccount?: ActiveWalletAccount
  onSubmit: (transaction: BuildApplicationCreateTransactionResult) => void
  onCancel: () => void
}

export function ApplicationCreateTransactionBuilder({ mode, transaction, activeAccount, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.ApplicationCreate,
        approvalProgram: values.approvalProgram,
        clearStateProgram: values.clearStateProgram,
        sender: await resolveSenderAddress(values.sender),
        onComplete: Number(values.onComplete),
        extraProgramPages: values.extraProgramPages,
        globalInts: values.globalInts,
        globalByteSlices: values.globalByteSlices,
        localInts: values.localInts,
        localByteSlices: values.localByteSlices,
        fee: values.fee,
        validRounds: values.validRounds,
        args: values.args.map((arg) => arg.value),
        note: values.note,
      })
    },
    [onSubmit, transaction?.id]
  )

  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        approvalProgram: transaction.approvalProgram,
        clearStateProgram: transaction.clearStateProgram,
        sender: transaction.sender?.autoPopulated ? undefined : transaction.sender,
        onComplete: transaction.onComplete.toString(),
        extraProgramPages: transaction.extraProgramPages,
        globalInts: transaction.globalInts,
        globalByteSlices: transaction.globalByteSlices,
        localInts: transaction.localInts,
        localByteSlices: transaction.localByteSlices,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
        args: transaction.args.map((arg) => ({
          id: randomGuid(),
          value: arg,
        })),
      }
    }

    return {
      sender: activeAccount ? asAddressOrNfd(activeAccount) : undefined,
      onComplete: algosdk.OnApplicationComplete.NoOpOC.toString(),
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
    }
  }, [mode, activeAccount, transaction])

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">{mode === TransactionBuilderMode.Edit ? 'Update' : 'Add'}</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <div className="space-y-4">
          {helper.textAreaField({
            field: 'approvalProgram',
            label: 'Approval program',
            helpText: 'The compiled AVM bytecode approval program, base64 encoded',
          })}
          {helper.textAreaField({
            field: 'clearStateProgram',
            label: 'Clear state program',
            helpText: 'The compiled AVM bytecode clear state program, base64 encoded',
          })}
          {helper.selectField({
            field: 'onComplete',
            label: 'On complete',
            options: onCompleteOptionsForAppCreate,
            helpText: 'Action to perform after creating the application',
          })}
          {helper.addressField({
            field: 'sender',
            label: 'Sender',
            helpText: 'Account to create from. Sends the transaction and pays the fee - optional for simulating',
          })}
          {helper.numberField({
            field: 'globalInts',
            label: 'Global ints',
            helpText: 'The number of integers stored in global state',
          })}
          {helper.numberField({
            field: 'globalByteSlices',
            label: 'Global byte slices',
            helpText: 'The number of byte slices stored in global state',
          })}
          {helper.numberField({
            field: 'localInts',
            label: 'Local ints',
            helpText: 'The number of integers stored in local state',
          })}
          {helper.numberField({
            field: 'localByteSlices',
            label: 'Local byte slices',
            helpText: 'The number of byte slices stored in local state',
          })}
          {helper.numberField({
            field: 'extraProgramPages',
            label: 'Extra program pages',
            helpText: 'Number of additional pages allocated to the programs. If empty this will be calculated automatically',
          })}
          {helper.arrayField({
            field: 'args',
            label: 'Arguments',
            helpText: 'Arguments that can be accessed from the program',
            addButtonLabel: 'Add Argument',
            noItemsLabel: 'No arguments.',
            newItem: () => {
              return {
                id: randomGuid(),
                value: '',
              }
            },
            renderChildField: (_, index) => {
              return helper.textField({
                field: `args.${index}.value`,
                label: `Argument ${index + 1}`,
                helpText: `A base64 encoded bytes value${index === 0 ? '. If using ABI, this should be the method selector' : ''}`,
              })
            },
          })}
          <TransactionBuilderFeeField />
          <TransactionBuilderValidRoundField />
          <TransactionBuilderNoteField />
        </div>
      )}
    </Form>
  )
}
