import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { isAddress } from '@/utils/is-address'
import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import { asOnCompleteLabel } from '../mappers/as-description-list-items'
import { algorandClient } from '@/features/common/data/algo-client'
import { BuildTransactionResult } from '../models'
import { asAlgosdkTransactions } from '../mappers'
import { isNfd } from '@/features/nfd/data'
import { OnApplicationComplete, makeEmptyTransactionSigner } from '@algorandfoundation/algokit-utils/transact'

export const requiredMessage = 'Required'

const invalidAddressOrNfdMessage = 'Invalid address or NFD'

export const addressFieldSchema = z
  .object({
    value: zfd.text().refine((value) => (value ? isAddress(value) || isNfd(value) : true), {
      message: invalidAddressOrNfdMessage,
    }),
    resolvedAddress: z.string(),
  })
  .superRefine((field, ctx) => {
    if (field.value && (!field.resolvedAddress || !isAddress(field.resolvedAddress))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: invalidAddressOrNfdMessage,
        path: ['value'],
      })
    }
  })

export const optionalAddressFieldSchema = z
  .object({
    value: zfd.text(z.string().optional()).refine((value) => (value ? isAddress(value) || isNfd(value) : true), {
      message: invalidAddressOrNfdMessage,
    }),
    resolvedAddress: z.string().optional(),
  })
  .superRefine((field, ctx) => {
    if (field.value && (!field.resolvedAddress || !isAddress(field.resolvedAddress))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: invalidAddressOrNfdMessage,
        path: ['value'],
      })
    }
  })

export const senderFieldSchema = { sender: addressFieldSchema }
export const receiverFieldSchema = { receiver: addressFieldSchema }

export const noteFieldSchema = { note: zfd.text(z.string().optional()) }

export const feeFieldSchema = {
  fee: z
    .object({
      setAutomatically: z.boolean(),
      value: numberSchema(z.number().min(0).optional()),
    })
    .superRefine((fee, ctx) => {
      if (!fee.setAutomatically && fee.value == null) {
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
    z.literal(OnApplicationComplete.NoOp.toString(), { required_error: requiredMessage }),
    z.literal(OnApplicationComplete.OptIn.toString(), { required_error: requiredMessage }),
    z.literal(OnApplicationComplete.ClearState.toString(), { required_error: requiredMessage }),
    z.literal(OnApplicationComplete.CloseOut.toString(), { required_error: requiredMessage }),
    z.literal(OnApplicationComplete.DeleteApplication.toString(), { required_error: requiredMessage }),
  ]),
}

export const onCompleteOptions = [
  { label: asOnCompleteLabel(OnApplicationComplete.NoOp), value: OnApplicationComplete.NoOp.toString() },
  { label: asOnCompleteLabel(OnApplicationComplete.OptIn), value: OnApplicationComplete.OptIn.toString() },
  { label: asOnCompleteLabel(OnApplicationComplete.ClearState), value: OnApplicationComplete.ClearState.toString() },
  { label: asOnCompleteLabel(OnApplicationComplete.CloseOut), value: OnApplicationComplete.CloseOut.toString() },
  {
    label: asOnCompleteLabel(OnApplicationComplete.DeleteApplication),
    value: OnApplicationComplete.DeleteApplication.toString(),
  },
]

export const onCompleteForAppCreateFieldSchema = {
  onComplete: z.union([
    z.literal(OnApplicationComplete.NoOp.toString(), { required_error: requiredMessage }),
    z.literal(OnApplicationComplete.OptIn.toString(), { required_error: requiredMessage }),
    z.literal(OnApplicationComplete.UpdateApplication.toString(), { required_error: requiredMessage }),
    z.literal(OnApplicationComplete.DeleteApplication.toString(), { required_error: requiredMessage }),
  ]),
}

export const onCompleteOptionsForAppCreate = [
  { label: asOnCompleteLabel(OnApplicationComplete.NoOp), value: OnApplicationComplete.NoOp.toString() },
  { label: asOnCompleteLabel(OnApplicationComplete.OptIn), value: OnApplicationComplete.OptIn.toString() },
  {
    label: asOnCompleteLabel(OnApplicationComplete.UpdateApplication),
    value: OnApplicationComplete.UpdateApplication.toString(),
  },
  {
    label: asOnCompleteLabel(OnApplicationComplete.DeleteApplication),
    value: OnApplicationComplete.DeleteApplication.toString(),
  },
]

export const commonSchema = {
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
}

export const commonFormData = zfd.formData(commonSchema)

export const buildComposer = async (transactions: BuildTransactionResult[]) => {
  const composer = algorandClient.newGroup()
  for (const transaction of transactions) {
    const txns = await asAlgosdkTransactions(transaction)
    txns.forEach((txn) => composer.addTransaction(txn))
  }
  return composer
}

const nullSigner = makeEmptyTransactionSigner()

export const buildComposerWithEmptySignatures = async (transactions: BuildTransactionResult[]) => {
  const composer = algorandClient.newGroup()
  for (const transaction of transactions) {
    const txns = await asAlgosdkTransactions(transaction)
    txns.forEach((txn) => composer.addTransaction(txn, nullSigner))
  }
  return composer
}
