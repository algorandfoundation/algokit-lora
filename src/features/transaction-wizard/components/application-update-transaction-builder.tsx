import { bigIntSchema } from '@/features/forms/data/common'
import { senderFieldSchema, commonSchema } from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { BuildApplicationUpdateTransactionResult, BuildableTransactionType } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { asAddressOrNfd } from '../mappers/as-address-or-nfd'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'

const formData = zfd.formData({
  ...commonSchema,
  ...senderFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  approvalProgram: zfd.text(z.string({ required_error: 'Required', invalid_type_error: 'Required' })),
  clearStateProgram: zfd.text(z.string({ required_error: 'Required', invalid_type_error: 'Required' })),
  args: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
})

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildApplicationUpdateTransactionResult
  activeAccount?: ActiveWalletAccount
  onSubmit: (transaction: BuildApplicationUpdateTransactionResult) => void
  onCancel: () => void
}

export function ApplicationUpdateTransactionBuilder({ mode, transaction, activeAccount, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.ApplicationUpdate,
        applicationId: BigInt(values.applicationId),
        approvalProgram: values.approvalProgram,
        clearStateProgram: values.clearStateProgram,
        sender: values.sender,
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
        applicationId: transaction.applicationId !== undefined ? BigInt(transaction.applicationId) : undefined,
        approvalProgram: transaction.approvalProgram,
        clearStateProgram: transaction.clearStateProgram,
        sender: transaction.sender,
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
          {helper.numberField({
            field: 'applicationId',
            label: 'Application ID',
            helpText: 'The application to be updated',
          })}
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
          {helper.addressField({
            field: 'sender',
            label: 'Sender',
            helpText: 'Account to update from. Sends the transaction and pays the fee',
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
