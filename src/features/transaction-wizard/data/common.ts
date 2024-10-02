import { ZERO_ADDRESS } from '@/features/common/constants'
import { BuildableTransactionFormField, BuildableTransactionFormFieldType } from '../models'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { isAddress } from '@/utils/is-address'
import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import algosdk from 'algosdk'
import { asOnCompleteLabel } from '../mappers/as-description-list-items'

export const requiredMessage = 'Required'

const invalidAddressMessage = 'Invalid address'
export const optionalAddressFieldSchema = zfd.text(z.string().optional()).refine((value) => (value ? isAddress(value) : true), {
  message: invalidAddressMessage,
})
export const addressFieldSchema = zfd.text().refine((value) => (value ? isAddress(value) : true), {
  message: invalidAddressMessage,
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
      value: numberSchema(z.number().min(0.001).optional()),
    })
    .superRefine((fee, ctx) => {
      if (!fee.setAutomatically && !fee.value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
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
      firstValid: bigIntSchema(z.bigint().min(1n).optional()),
      lastValid: bigIntSchema(z.bigint().min(1n).optional()),
    })
    .superRefine((validRounds, ctx) => {
      if (!validRounds.setAutomatically) {
        if (!validRounds.firstValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: requiredMessage,
            path: ['firstValid'],
          })
        }
        if (!validRounds.lastValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: requiredMessage,
            path: ['lastValid'],
          })
        }

        if (validRounds.firstValid && validRounds.lastValid && validRounds.firstValid > validRounds.lastValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'First valid round must be less than or equal to last valid round',
            path: ['firstValid'],
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

export const onCompleteField = {
  onComplete: z.union([
    z.literal(algosdk.OnApplicationComplete.NoOpOC.toString(), { required_error: requiredMessage }),
    z.literal(algosdk.OnApplicationComplete.OptInOC.toString(), { required_error: requiredMessage }),
    z.literal(algosdk.OnApplicationComplete.ClearStateOC.toString(), { required_error: requiredMessage }),
    z.literal(algosdk.OnApplicationComplete.CloseOutOC.toString(), { required_error: requiredMessage }),
    z.literal(algosdk.OnApplicationComplete.DeleteApplicationOC.toString(), { required_error: requiredMessage }),
  ]),
}

export const onCompleteOptions = [
  { label: asOnCompleteLabel(algosdk.OnApplicationComplete.NoOpOC), value: algosdk.OnApplicationComplete.NoOpOC.toString() },
  { label: asOnCompleteLabel(algosdk.OnApplicationComplete.OptInOC), value: algosdk.OnApplicationComplete.OptInOC.toString() },
  { label: asOnCompleteLabel(algosdk.OnApplicationComplete.ClearStateOC), value: algosdk.OnApplicationComplete.ClearStateOC.toString() },
  { label: asOnCompleteLabel(algosdk.OnApplicationComplete.CloseOutOC), value: algosdk.OnApplicationComplete.CloseOutOC.toString() },
  {
    label: asOnCompleteLabel(algosdk.OnApplicationComplete.DeleteApplicationOC),
    value: algosdk.OnApplicationComplete.DeleteApplicationOC.toString(),
  },
]

export const commonSchema = {
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
}

export const commonFormData = zfd.formData(commonSchema)
