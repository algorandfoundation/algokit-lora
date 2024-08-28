import { ZERO_ADDRESS } from '@/features/common/constants'
import { BuildableTransactionFormField, BuildableTransactionFormFieldType } from '../models'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { isAddress } from '@/utils/is-address'

export const optionalAddressFieldSchema = zfd.text(z.string().optional()).refine((value) => (value ? isAddress(value) : true), {
  message: 'Invalid address',
})
export const addressFieldSchema = zfd.text().refine((value) => (value ? isAddress(value) : true), {
  message: 'Invalid address',
})

export const senderFieldSchema = { sender: addressFieldSchema }
export const senderField = {
  sender: {
    label: 'Sender address',
    description: 'Account to pay from. Sends the transaction and pays the fee',
    type: BuildableTransactionFormFieldType.Account,
    placeholder: ZERO_ADDRESS,
  } satisfies BuildableTransactionFormField,
}

export const receiverFieldSchema = { receiver: addressFieldSchema }
export const receiverField = {
  receiver: {
    label: 'Receiver address',
    description: 'Account to pay to',
    type: BuildableTransactionFormFieldType.Account,
    placeholder: ZERO_ADDRESS,
  } satisfies BuildableTransactionFormField,
}

export const noteFieldSchema = { note: zfd.text(z.string().optional()) }
export const noteField = {
  note: {
    label: 'Note',
    description: 'A note for the transaction',
    type: BuildableTransactionFormFieldType.Text,
  } satisfies BuildableTransactionFormField,
}

export const feeFieldSchema = {
  fee: z
    .object({
      setAutomatically: z.boolean(),
      value: zfd.numeric(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0.001)).optional(),
    })
    .superRefine((fee, ctx) => {
      if (!fee.setAutomatically && !fee.value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['value'],
        })
      }
    }),
}

export const feeField = {
  fee: {
    label: 'Set fee automatically',
    type: BuildableTransactionFormFieldType.Fee,
  } satisfies BuildableTransactionFormField,
}

export const validRoundsFieldSchema = {
  validRounds: z
    .object({
      setAutomatically: z.boolean(),
      firstValid: zfd.numeric(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' }).min(1n)).optional(),
      lastValid: zfd.numeric(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' }).min(1n)).optional(),
    })
    .superRefine((fee, ctx) => {
      if (!fee.setAutomatically) {
        if (!fee.firstValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Required',
            path: ['firstValid'],
          })
        }
        if (!fee.lastValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Required',
            path: ['lastValid'],
          })
        }
      }
    }),
}

export const validRoundsField = {
  validRounds: {
    label: 'Set valid rounds automatically',
    type: BuildableTransactionFormFieldType.ValidRounds,
  } satisfies BuildableTransactionFormField,
}
