import algosdk from 'algosdk'
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
import { BuildAppCallTransactionResult, BuildableTransactionType } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'

const formData = zfd.formData({
  ...commonSchema,
  ...senderFieldSchema,
  applicationId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  args: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
  onComplete: z.union([
    z.literal(algosdk.OnApplicationComplete.NoOpOC.toString()),
    z.literal(algosdk.OnApplicationComplete.OptInOC.toString()),
    z.literal(algosdk.OnApplicationComplete.ClearStateOC.toString()),
    z.literal(algosdk.OnApplicationComplete.CloseOutOC.toString()),
    z.literal(algosdk.OnApplicationComplete.DeleteApplicationOC.toString()),
  ]),
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
        onComplete: Number(values.onComplete),
      })
    },
    [onSubmit, transaction?.id]
  )

  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        applicationId: transaction.applicationId ? BigInt(transaction.applicationId) : undefined,
        sender: transaction.sender,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        args: transaction.args.map((arg) => ({
          id: randomGuid(),
          value: arg,
        })),
        onComplete: transaction.onComplete.toString(),
      }
    }
    return {
      sender: activeAddress,
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
      applicationId: _defaultValues?.applicationId ? BigInt(_defaultValues.applicationId) : undefined,
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
          {helper.numberField({
            field: 'applicationId',
            label: 'Application ID',
          })}
          {helper.textField({
            field: 'sender',
            label: 'Sender',
          })}
          {helper.arrayField({
            field: 'args',
            label: 'Arguments',
            addButtonLabel: 'Add Argument',
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
          {helper.selectField({
            field: 'onComplete',
            label: 'On Complete',
            options: [
              { label: 'NoOp', value: algosdk.OnApplicationComplete.NoOpOC.toString() },
              { label: 'Opt In', value: algosdk.OnApplicationComplete.OptInOC.toString() },
              { label: 'Clear State', value: algosdk.OnApplicationComplete.ClearStateOC.toString() },
              { label: 'Close Out', value: algosdk.OnApplicationComplete.CloseOutOC.toString() },
              { label: 'Delete Application', value: algosdk.OnApplicationComplete.DeleteApplicationOC.toString() },
            ],
          })}
          <TransactionBuilderFeeField />
          <TransactionBuilderValidRoundField />
        </div>
      )}
    </Form>
  )
}
