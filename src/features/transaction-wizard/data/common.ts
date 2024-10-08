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

export const receiverFieldSchema = { receiver: addressFieldSchema }

export const noteFieldSchema = { note: zfd.text(z.string().optional()) }

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

export const onCompleteFieldSchema = {
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
