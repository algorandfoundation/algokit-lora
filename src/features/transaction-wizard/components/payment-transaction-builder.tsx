import { numberSchema } from '@/features/forms/data/common'
import { commoSchema, receiverFieldSchema, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildPaymentTransactionResult } from '../models'
import { randomGuid } from '@/utils/random-guid'

const formSchema = {
  ...commoSchema,
  ...senderFieldSchema,
  ...receiverFieldSchema,
  amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0.000001)),
}
const formData = zfd.formData(formSchema)

type Props = {
  transaction?: BuildPaymentTransactionResult
  onSubmit: (transaction: BuildPaymentTransactionResult) => void
  onCancel: () => void
}

export function PaymentTransactionBuilder({ transaction, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.Payment,
        sender: data.sender,
        receiver: data.receiver,
        amount: data.amount,
        note: data.note,
        fee: {
          setAutomatically: data.fee.setAutomatically,
          value: data.fee.value,
        },
        validRounds: {
          setAutomatically: data.validRounds.setAutomatically,
          firstValid: data.validRounds.firstValid,
          lastValid: data.validRounds.lastValid,
        },
      })
    },
    [onSubmit, transaction?.id]
  )
  const defaultValues = useMemo(() => {
    if (!transaction) {
      return {
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      } satisfies Partial<z.infer<typeof formData>>
    }
    return {
      sender: transaction.sender,
      receiver: transaction.receiver,
      amount: transaction.amount,
      fee: {
        setAutomatically: transaction.fee.setAutomatically,
        value: transaction.fee.value,
      },
      validRounds: {
        setAutomatically: transaction.validRounds.setAutomatically,
        firstValid: transaction.validRounds.firstValid,
        lastValid: transaction.validRounds.lastValid,
      },
      note: transaction.note,
    } satisfies Partial<z.infer<typeof formData>>
  }, [transaction])

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">Create</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {helper.textField({
            field: 'sender',
            label: 'Sender',
          })}
          {helper.textField({
            field: 'receiver',
            label: 'Receiver',
          })}
          {helper.numberField({
            field: 'amount',
            label: 'Amount',
            decimalScale: 6,
          })}
          <TransactionBuilderFeeField />
          <TransactionBuilderValidRoundField />
        </>
      )}
    </Form>
  )
}
