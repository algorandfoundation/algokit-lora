import { numberSchema } from '@/features/forms/data/common'
import { commonSchema, optionalSenderFieldShape, receiverFieldSchema } from '../data/common'
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
import { TransactionBuilderMode } from '../data'
import { ZERO_ADDRESS } from '@/features/common/constants'
import SvgAlgorand from '@/features/common/components/icons/algorand'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { asAddressOrNfd, asOptionalAddressOrNfd } from '../mappers/as-address-or-nfd'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'
import defineSenderAddress from '../utils/resolve-sender-address'

const receiverLabel = 'Receiver'

export const paymentFormSchema = z.object({
  ...optionalSenderFieldShape,
  ...commonSchema,
  ...receiverFieldSchema,
  amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0)),
})
const formData = zfd.formData(paymentFormSchema)

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildPaymentTransactionResult
  activeAccount?: ActiveWalletAccount
  onSubmit: (transaction: BuildPaymentTransactionResult) => void
  onCancel: () => void
}

export function PaymentTransactionBuilder({ mode, transaction, activeAccount, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.Payment,
        sender: await defineSenderAddress(data.sender),
        receiver: data.receiver,
        amount: data.amount,
        fee: data.fee,
        validRounds: data.validRounds,
        note: data.note,
      })
    },
    [onSubmit, transaction?.id]
  )
  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        sender: asOptionalAddressOrNfd(transaction.sender!),
        receiver: asAddressOrNfd(transaction.receiver.resolvedAddress),
        amount: transaction.amount,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
      }
    }

    return {
      sender: activeAccount
        ? asOptionalAddressOrNfd({ value: activeAccount.address, resolvedAddress: activeAccount.address, autoPopulated: true })
        : undefined,
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
    }
  }, [activeAccount, mode, transaction])

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
        <>
          {helper.addressField({
            field: 'sender',
            label: 'Sender',
            helpText: 'Account to pay from. Sends the transaction and pays the fee - optional for simulating',
            placeholder: ZERO_ADDRESS,
          })}
          {helper.addressField({
            field: 'receiver',
            label: receiverLabel,
            helpText: 'Account to receive the amount',
            placeholder: ZERO_ADDRESS,
          })}
          {helper.numberField({
            field: 'amount',
            label: (
              <span className="flex items-center gap-1.5">
                Amount to pay
                <SvgAlgorand className="h-auto w-3" />
              </span>
            ),
            decimalScale: 6,
            helpText: `Amount to pay the '${receiverLabel}' account`,
          })}
          <TransactionBuilderFeeField />
          <TransactionBuilderValidRoundField />
          <TransactionBuilderNoteField />
        </>
      )}
    </Form>
  )
}
