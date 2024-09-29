import { BuildableTransactionFormFieldType, BuildableTransaction, BuildableTransactionFormField, BuildableTransactionType } from '../models'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { algorandClient } from '@/features/common/data/algo-client'
import { algos } from '@algorandfoundation/algokit-utils'
import {
  addressFieldSchema,
  feeField,
  feeFieldSchema,
  noteField,
  noteFieldSchema,
  optionalAddressFieldSchema,
  receiverField,
  receiverFieldSchema,
  senderField,
  senderFieldSchema,
  validRoundsField,
  validRoundsFieldSchema,
} from './common'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { numberSchema } from '@/features/forms/data/common'

const amountField = {
  amount: {
    label: 'Amount',
    description: 'Amount to pay',
    type: BuildableTransactionFormFieldType.AlgoAmount,
    placeholder: '1',
  } satisfies BuildableTransactionFormField,
}

const createPayment = async (data: z.infer<typeof paymentSchema>) => {
  const transaction = await algorandClient.createTransaction.payment({
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
  return transaction
}

const createAccountClose = async (data: z.infer<typeof accountCloseSchema>) => {
  const transaction = await algorandClient.createTransaction.payment({
    sender: data.sender,
    receiver: data.receiver ?? data.sender,
    closeRemainderTo: data.closeRemainderTo,
    amount: algos(data.amount ?? 0),
    note: data.note,
    ...(!data.fee.setAutomatically && data.fee.value ? { staticFee: algos(data.fee.value) } : undefined),
    ...(!data.validRounds.setAutomatically && data.validRounds.firstValid && data.validRounds.lastValid
      ? {
          firstValidRound: data.validRounds.firstValid,
          lastValidRound: data.validRounds.lastValid,
        }
      : undefined),
  })
  return transaction
}

const paymentSchema = zfd.formData({
  ...senderFieldSchema,
  ...receiverFieldSchema,
  amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0.000001)),
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})
export const paymentTransaction = {
  type: BuildableTransactionType.Payment,
  label: 'Payment (pay)',
  fields: {
    ...senderField,
    ...receiverField,
    ...amountField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {
    amount: '' as unknown as undefined,
  },
  schema: paymentSchema,
  createTransaction: createPayment,
} satisfies BuildableTransaction<typeof paymentSchema>

const accountCloseSchema = zfd.formData(
  z
    .object({
      ...senderFieldSchema,
      closeRemainderTo: addressFieldSchema,
      receiver: optionalAddressFieldSchema,
      amount: numberSchema(z.number().min(0.000001).optional()),
      ...feeFieldSchema,
      ...validRoundsFieldSchema,
      ...noteFieldSchema,
    })
    .superRefine((data, ctx) => {
      if (data.amount && data.amount > 0 && !data.receiver) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['receiver'],
        })
      }

      if (data.receiver && !data.amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['amount'],
        })
      }
    })
)

export const accountCloseTransaction = {
  type: BuildableTransactionType.AccountClose,
  label: 'Account close (pay)',
  fields: {
    ...senderField,
    closeRemainderTo: {
      label: 'Close remainder to',
      description: 'Account to receive the balance when sender account is closed',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    },
    ...receiverField,
    ...amountField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {
    amount: '' as unknown as undefined,
  },
  schema: accountCloseSchema,
  createTransaction: createAccountClose,
} satisfies BuildableTransaction<typeof accountCloseSchema>
