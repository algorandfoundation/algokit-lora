import algosdk from 'algosdk'
import { bigIntSchema } from '@/features/forms/data/common'
import { senderFieldSchema, commonSchema, onCompleteFieldSchema, onCompleteOptions } from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from '@/features/transaction-wizard/components/transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from '@/features/transaction-wizard/components/transaction-builder-valid-round-field'
import { BuildAppCallTransactionResult, BuildableTransactionType } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'

const formData = zfd.formData({
  ...commonSchema,
  ...senderFieldSchema,
  ...onCompleteFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  args: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
})

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildAppCallTransactionResult
  activeAddress?: string
  defaultValues?: Partial<BuildAppCallTransactionResult>
  onSubmit: (transaction: BuildAppCallTransactionResult) => void
  onCancel: () => void
}

export function AppCallTransactionBuilder({ mode, transaction, activeAddress, defaultValues: _defaultValues, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AppCall,
        applicationId: Number(values.applicationId),
        sender: values.sender,
        fee: values.fee,
        validRounds: values.validRounds,
        args: values.args.map((arg) => arg.value),
        note: values.note,
        onComplete: Number(values.onComplete),
      })
    },
    [onSubmit, transaction?.id]
  )

  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        applicationId: transaction.applicationId !== undefined ? BigInt(transaction.applicationId) : undefined,
        sender: transaction.sender,
        onComplete: transaction.onComplete.toString(),
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
      sender: activeAddress,
      onComplete: algosdk.OnApplicationComplete.NoOpOC.toString(),
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
      applicationId: _defaultValues?.applicationId !== undefined ? BigInt(_defaultValues.applicationId) : undefined,
    }
  }, [mode, activeAddress, _defaultValues?.applicationId, transaction])

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
          {defaultValues.applicationId !== 0n &&
            helper.numberField({
              field: 'applicationId',
              label: 'Application ID',
              helpText: 'The application to be called',
            })}
          {helper.selectField({
            field: 'onComplete',
            label: 'On complete',
            options: onCompleteOptions,
            helpText: 'Action to perform after executing the program',
          })}
          {helper.textField({
            field: 'sender',
            label: 'Sender',
            helpText: 'Account to call from. Sends the transaction and pays the fee',
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
