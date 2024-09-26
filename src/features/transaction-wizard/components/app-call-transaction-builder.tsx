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
import { invariant } from '@/utils/invariant'

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
})

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildAppCallTransactionResult
  defaultValues?: Partial<BuildAppCallTransactionResult>
  onSubmit: (transaction: BuildAppCallTransactionResult) => void
  onCancel: () => void
}

export function AppCallTransactionBuilder({ mode, transaction, defaultValues: defaultValuesProps, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (values: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AppCall,
        applicationId: Number(values.applicationId), // TODO: PD - handle bigint
        sender: values.sender,
        fee: values.fee,
        validRounds: values.validRounds,
        args: values.args.map((arg) => arg.value),
      })
    },
    [onSubmit, transaction?.id]
  )

  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Create) {
      return {
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
        applicationId: defaultValuesProps?.applicationId ? BigInt(defaultValuesProps.applicationId) : undefined, // TODO: PD - handle bigint
      }
    } else if (mode === TransactionBuilderMode.Edit) {
      invariant(transaction, 'Transaction is required in edit mode')
      return {
        applicationId: transaction.applicationId ? BigInt(transaction.applicationId) : undefined, // TODO: PD - handle bigint
        sender: transaction.sender,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        args: transaction.args.map((arg) => ({
          id: randomGuid(),
          value: arg,
        })),
      }
    }
    return {}
  }, [mode, defaultValuesProps, transaction])

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">Save</SubmitButton>
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
          <TransactionBuilderFeeField />
          <TransactionBuilderValidRoundField />
        </div>
      )}
    </Form>
  )
}
