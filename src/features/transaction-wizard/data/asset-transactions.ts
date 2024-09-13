import { numberSchema } from '@/features/forms/data/common'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { BuildableTransaction, BuildableTransactionFormField, BuildableTransactionFormFieldType } from '../models'
import {
  senderFieldSchema,
  receiverFieldSchema,
  feeFieldSchema,
  validRoundsFieldSchema,
  noteFieldSchema,
  feeField,
  validRoundsField,
  noteField,
  optionalAddressFieldSchema,
  addressFieldSchema,
} from './common'
import { amountField } from './payment-transactions'
import { algorandClient } from '@/features/common/data/algo-client'
import { algos } from '@algorandfoundation/algokit-utils'

const assetnameField = {
  assetname: {
    label: 'Asset Name',
    description: 'The name of the asset.',
    type: BuildableTransactionFormFieldType.Text,
    placeholder: '',
  } satisfies BuildableTransactionFormField,
}

const createAssetTransfer = async (data: z.infer<typeof assetTransferSchema>) => {
  const transaction = await algorandClient.transactions.assetTransfer({
    sender: data.sender,
    receiver: data.receiver,
    amount: BigInt(data.amount),
    assetId: BigInt(data.assetId),
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
  assetId: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' })),
  assetname: zfd.text(z.string().optional()),
  amount: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0)),
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})

export const assetTransferTransaction = {
  label: 'Asset Transfer (axfer)',
  fields: {
    assetId: {
      label: 'Asset ID',
      description: 'The unique ID of the asset to be transferred.',
      type: BuildableTransactionFormFieldType.AssetId,
      placeholder: '',
    } satisfies BuildableTransactionFormField,
    ...assetnameField,
    sender: {
      label: 'Sender address',
      description: 'Sends the transaction, sends the asset and pays the fee',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
    receiver: {
      label: 'Receiver address',
      description: 'Receives the asset',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
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
    assetId: BigInt(data.assetId),
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
  assetId: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' })),
  assetname: zfd.text(z.string().optional()),
  ...senderFieldSchema,
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})

export const assetOptInTransaction = {
  label: 'Asset opt in (axfer)',
  fields: {
    assetId: {
      label: 'Asset ID',
      description: 'The unique ID of the asset to be opted in.',
      type: BuildableTransactionFormFieldType.AssetId,
      placeholder: '',
    } satisfies BuildableTransactionFormField,
    ...assetnameField,
    sender: {
      label: 'Sender address',
      description: 'Sends the transaction, opts in to the asset and pays the fee',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
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
    assetId: {
      label: 'Asset ID',
      description: 'The unique ID of the asset to be opted out.',
      type: BuildableTransactionFormFieldType.AssetId,
      placeholder: '',
    } satisfies BuildableTransactionFormField,
    ...assetnameField,
    sender: {
      label: 'Sender address',
      description: 'Sends the transaction, opts out of the asset and pays the fee',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
    closeTo: {
      label: 'Close To (optional)',
      description: 'Account that receives any balance of the asset',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: '',
    } satisfies BuildableTransactionFormField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {},
  schema: assetOptOutSchema,
  createTransaction: createAssetOptOut,
} satisfies BuildableTransaction<typeof assetOptOutSchema>

const createAssetRevoke = async (data: z.infer<typeof assetRevokeSchema>) => {
  const transaction = await algorandClient.transactions.assetTransfer({
    sender: data.sender,
    receiver: data.receiver,
    amount: data.amount,
    clawbackTarget: data.assetsender,
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

const assetRevokeSchema = zfd.formData({
  assetId: numberSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  assetname: zfd.text(z.string().optional()),
  ...senderFieldSchema,
  ...receiverFieldSchema,
  assetsender: addressFieldSchema,
  amount: numberSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' }).min(0n)),
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})

export const assetRevokeTransaction = {
  label: 'Asset revoke (axfer)',
  fields: {
    assetId: {
      label: 'Asset ID',
      description: 'The unique ID of the asset to be revoked.',
      type: BuildableTransactionFormFieldType.AssetId,
      placeholder: '',
    } satisfies BuildableTransactionFormField,
    ...assetnameField,
    sender: {
      label: 'Sender address',
      description: 'Must be the clawback address. Sends the transaction and pays the fee',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
    receiver: {
      label: 'Receiver address',
      description: 'Receives the asset',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
    assetsender: {
      label: 'Asset sender',
      description: 'Account the asset will be revoked from',
      type: BuildableTransactionFormFieldType.Account,
      placeholder: ZERO_ADDRESS,
    } satisfies BuildableTransactionFormField,
    amount: {
      label: 'Amount',
      description: 'Amount to claw back',
      type: BuildableTransactionFormFieldType.AlgoAmount,
      placeholder: '0',
    } satisfies BuildableTransactionFormField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {},
  schema: assetRevokeSchema,
  createTransaction: createAssetRevoke,
} satisfies BuildableTransaction<typeof assetRevokeSchema>
