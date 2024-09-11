import { numberSchema } from '@/features/forms/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { BuildableTransaction, BuildableTransactionFormField, BuildableTransactionFormFieldType } from '../models'
import {
  senderFieldSchema,
  receiverFieldSchema,
  feeFieldSchema,
  validRoundsFieldSchema,
  noteFieldSchema,
  senderField,
  receiverField,
  feeField,
  validRoundsField,
  noteField,
  addressFieldSchema,
  optionalAddressFieldSchema,
} from './common'
import { amountField } from './payment-transactions'
import { algorandClient } from '@/features/common/data/algo-client'
import { algos } from '@algorandfoundation/algokit-utils'

const assetIdField = {
  assetId: {
    label: 'Asset ID',
    description: 'The unique ID of the asset to be transferred.',
    type: BuildableTransactionFormFieldType.AssetId,
    placeholder: '',
  } satisfies BuildableTransactionFormField,
}
const assetnameField = {
  assetname: {
    label: 'Asset Name',
    description: 'The name of the asset to be transferred.',
    type: BuildableTransactionFormFieldType.Text,
    placeholder: '',
  } satisfies BuildableTransactionFormField,
}

const closeToField = {
  closeTo: {
    label: 'Close To (optional)',
    description: 'Account that receives any balance of the asset',
    type: BuildableTransactionFormFieldType.Account,
    placeholder: '',
  } satisfies BuildableTransactionFormField,
}

const createAssetTransfer = async (data: z.infer<typeof assetTransferSchema>) => {
  const transaction = await algorandClient.transactions.assetTransfer({
    sender: data.sender,
    receiver: data.receiver,
    amount: data.amount,
    assetId: data.assetId,
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

const assetTransferSchema = zfd.formData({
  ...senderFieldSchema,
  ...receiverFieldSchema,
  assetId: numberSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  assetname: zfd.text(z.string().optional()),
  amount: numberSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' }).min(0n)),
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})

export const assetTransferTransaction = {
  label: 'Asset Transfer (axfer)',
  fields: {
    ...assetIdField,
    ...assetnameField,
    ...senderField,
    ...receiverField,
    ...amountField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {
    amount: 0 as unknown as undefined,
  },
  schema: assetTransferSchema,
  createTransaction: createAssetTransfer,
} satisfies BuildableTransaction<typeof assetTransferSchema>

const createAssetOptIn = async (data: z.infer<typeof assetOptInSchema>) => {
  const transaction = await algorandClient.transactions.assetOptIn({
    sender: data.sender,
    assetId: data.assetId,
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

const assetOptInSchema = zfd.formData({
  assetId: numberSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  assetname: zfd.text(z.string().optional()),
  ...senderFieldSchema,
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})

export const assetOptInTransaction = {
  label: 'Asset opt in (axfer)',
  fields: {
    ...assetIdField,
    ...assetnameField,
    ...senderField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {},
  schema: assetOptInSchema,
  createTransaction: createAssetOptIn,
} satisfies BuildableTransaction<typeof assetOptInSchema>

const createAssetOptOut = async (data: z.infer<typeof assetOptOutSchema>) => {
  const transaction = await algorandClient.transactions.assetOptOut({
    assetId: data.assetId,
    sender: data.sender,
    creator: data.closeTo ?? data.sender, // Are you sure about this?
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

const assetOptOutSchema = zfd.formData({
  assetId: numberSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  assetname: zfd.text(z.string().optional()),
  ...senderFieldSchema,
  closeTo: optionalAddressFieldSchema,
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})

export const assetOptOutTransaction = {
  label: 'Asset opt out (axfer)',
  fields: {
    ...assetIdField,
    ...assetnameField,
    ...senderField,
    ...closeToField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {},
  schema: assetOptOutSchema,
  createTransaction: createAssetOptOut,
} satisfies BuildableTransaction<typeof assetOptOutSchema>
