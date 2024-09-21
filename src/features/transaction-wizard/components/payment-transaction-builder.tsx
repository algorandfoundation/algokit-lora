import algosdk from 'algosdk'
import { numberSchema } from '@/features/forms/data/common'
import { commoSchema, receiverFieldSchema, senderFieldSchema } from '../data/common'
import { z } from 'zod'
import { useCallback } from 'react'
import { zfd } from 'zod-form-data'
import { algorandClient } from '@/features/common/data/algo-client'
import { algos } from '@algorandfoundation/algokit-utils'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'

const formSchema = {
  ...commoSchema,
  ...senderFieldSchema,
  ...receiverFieldSchema,
  amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0.000001)),
}
const formData = zfd.formData(formSchema)

type Props = {
  onSubmit: (transactions: algosdk.Transaction[]) => void
  onCancel: () => void
}

export function PaymentTransactionBuilder({ onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      const transaction = await algorandClient.transactions.payment({
        sender: data.sender,
        receiver: data.receiver,
        amount: algos(data.amount),
        note: data.note,
        ...(!data.fee.setAutomatically && data.fee.value ? { staticFee: algos(data.fee.value) } : undefined),
        ...(!data.validRounds.setAutomatically && data.validRounds.firstValid && data.validRounds.lastValid
          ? {
              firstValidRound: data.validRounds.firstValid,
              lastValidRound: data.validRounds.lastValid,
            }
          : undefined),
      })
      onSubmit([transaction])
    },
    [onSubmit]
  )

  return (
    <Form
      schema={formData}
      onSubmit={submit}
      defaultValues={{
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      }}
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
