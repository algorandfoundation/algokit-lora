import { BuildableTransactionFormFieldType, BuildableTransaction, BuildableTransactionFormField } from '../models'
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

const amountFieldSchema = {
  amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0.000001)),
}

const amountField = {
  amount: {
    label: 'Amount',
    description: 'Amount to pay',
    type: BuildableTransactionFormFieldType.AlgoAmount,
    placeholder: '1',
  } satisfies BuildableTransactionFormField,
}

// TODO: NC - Can potentially get some re-use here. Could we setup common fields?

const createPayment = async (data: z.infer<typeof paymentSchema>) => {
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
    signer: noOpSigner,
  })
  return transaction
}

// This is a temporary measure as there is a utils-ts issue which prevents creating a transaction without a singer
const noOpSigner = () => Promise.resolve([])

const createAccountClose = async (data: z.infer<typeof accountCloseSchema>) => {
  const transaction = await algorandClient.transactions.payment({
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
    signer: noOpSigner,
  })
  return transaction
}

const paymentSchema = zfd.formData({
  ...senderFieldSchema,
  ...receiverFieldSchema,
  ...amountFieldSchema,
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})
export const paymentTransaction = {
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
    fee: {
      setAutomatically: true,
    },
    validRounds: {
      setAutomatically: true,
    },
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

// TODO: NC - Can we have a required override, so we can explicitly set, if it can't be inferred?

export const accountCloseTransaction = {
  label: 'Account close (pay)',
  fields: {
    ...senderField,
    closeRemainderTo: {
      label: 'Close remainder to',
      description: 'Account to receive the balance when sender account is closed',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
    ...receiverField,
    ...amountField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {
    amount: '' as unknown as undefined, // TODO: NC - Need to ensure that everywhere we have a we have this
    fee: {
      setAutomatically: true,
    },
    validRounds: {
      setAutomatically: true,
    },
  },
  schema: accountCloseSchema,
  createTransaction: createAccountClose,
} satisfies BuildableTransaction<typeof accountCloseSchema>
