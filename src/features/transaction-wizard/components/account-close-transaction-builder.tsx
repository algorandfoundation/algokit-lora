import { numberSchema } from '@/features/forms/data/common'
import {
  addressFieldSchema,
  commonSchema,
  optionalAddressFieldSchema,
  optionalSenderFieldShape,
} from '@/features/transaction-wizard/data/common'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { zfd } from 'zod-form-data'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { TransactionBuilderFeeField } from './transaction-builder-fee-field'
import { TransactionBuilderValidRoundField } from './transaction-builder-valid-round-field'
import { Form } from '@/features/forms/components/form'
import { BuildableTransactionType, BuildAccountCloseTransactionResult } from '../models'
import { randomGuid } from '@/utils/random-guid'
import { TransactionBuilderMode } from '../data'
import { ZERO_ADDRESS } from '@/features/common/constants'
import SvgAlgorand from '@/features/common/components/icons/algorand'
import { TransactionBuilderNoteField } from './transaction-builder-note-field'
import { asAddressOrNfd, asOptionalAddressOrNfd } from '../mappers/as-address-or-nfd'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'

import defineSenderAddress from '../utils/defineSenderAddress'
import { useNetworkConfig } from '@/features/network/data'

const senderLabel = 'Sender'
const receiverLabel = 'Receiver'
const closeRemainderToLabel = 'Close remainder to'

const formSchema = z
  .object({
    ...commonSchema,
    ...optionalSenderFieldShape,
    closeRemainderTo: addressFieldSchema,
    receiver: optionalAddressFieldSchema,
    amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0).optional()),
  })
  .superRefine((data, ctx) => {
    if (data.amount && data.amount > 0 && (!data.receiver || !data.receiver.resolvedAddress)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required',
        path: ['receiver.value'],
      })
    }

    if (data.receiver && data.receiver.resolvedAddress && data.amount == undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required',
        path: ['amount'],
      })
    }
  })
const formData = zfd.formData(formSchema)

type Props = {
  mode: TransactionBuilderMode
  transaction?: BuildAccountCloseTransactionResult
  activeAccount?: ActiveWalletAccount
  onSubmit: (transaction: BuildAccountCloseTransactionResult) => void
  onCancel: () => void
}

export function AccountCloseTransactionBuilder({ mode, transaction, activeAccount, onSubmit, onCancel }: Props) {
  const { id: networkId } = useNetworkConfig()

  const submit = useCallback(
    async (data: z.infer<typeof formData>) => {
      onSubmit({
        id: transaction?.id ?? randomGuid(),
        type: BuildableTransactionType.AccountClose,
        sender: await defineSenderAddress(data.sender!, networkId),
        closeRemainderTo: data.closeRemainderTo,
        receiver: asOptionalAddressOrNfd(data.receiver),
        amount: data.amount,
        fee: data.fee,
        validRounds: data.validRounds,
        note: data.note,
      })
    },
    [onSubmit, transaction?.id, networkId]
  )
  const defaultValues = useMemo<Partial<z.infer<typeof formData>>>(() => {
    if (mode === TransactionBuilderMode.Edit && transaction) {
      return {
        sender: transaction.sender,
        closeRemainderTo: transaction.closeRemainderTo,
        receiver: transaction.receiver,
        amount: transaction.amount,
        fee: transaction.fee,
        validRounds: transaction.validRounds,
        note: transaction.note,
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
            label: senderLabel,
            helpText: 'Account to be closed. Sends the transaction and pays the fee',
            placeholder: ZERO_ADDRESS,
          })}
          {helper.addressField({
            field: 'closeRemainderTo',
            label: closeRemainderToLabel,
            helpText: `Account to receive the remaining balance when '${senderLabel}' account is closed`,
            placeholder: ZERO_ADDRESS,
          })}
          {helper.addressField({
            field: 'receiver',
            label: receiverLabel,
            helpText: `Account to receive the amount. Leave blank if '${closeRemainderToLabel}' account should receive the full balance`,
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
            helpText: `Amount to pay the '${receiverLabel}' account. Leave blank if '${closeRemainderToLabel}' account should get the full balance`,
          })}
          <TransactionBuilderFeeField />
          <TransactionBuilderValidRoundField />
          <TransactionBuilderNoteField />
        </>
      )}
    </Form>
  )
}
