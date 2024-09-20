import { bigIntSchema } from '@/features/forms/data/common'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { BuildableTransaction, BuildableTransactionFormField, BuildableTransactionFormFieldType, BuildableTransactionType } from '../models'
import {
  feeField,
  feeFieldSchema,
  noteField,
  noteFieldSchema,
  senderField,
  senderFieldSchema,
  validRoundsField,
  validRoundsFieldSchema,
} from './common'
import { algorandClient } from '@/features/common/data/algo-client'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { algos } from '@algorandfoundation/algokit-utils'

const rawAppCallSchema = zfd.formData({
  ...senderFieldSchema,
  appId: bigIntSchema(z.bigint({ required_error: 'Required', invalid_type_error: 'Required' })),
  // TODO: PD - JSON serialisation of app args should exclude the ids
  appArgs: zfd.repeatableOfType(
    z.object({
      id: z.string(),
      value: zfd.text(),
    })
  ),
  ...feeFieldSchema,
  ...validRoundsFieldSchema,
  ...noteFieldSchema,
})

const createRawAppCall = async (data: z.infer<typeof rawAppCallSchema>) => {
  const transaction = await algorandClient.transactions.appCall({
    sender: data.sender,
    appId: BigInt(data.appId),
    args: data.appArgs.map((arg) => base64ToBytes(arg.value)),
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

export const rawAppCallTransaction = {
  label: 'App Call (raw)',
  fields: {
    ...senderField,
    appId: {
      label: 'Application ID',
      description: 'The application to call',
      type: BuildableTransactionFormFieldType.Number,
    } satisfies BuildableTransactionFormField,
    appArgs: {
      label: 'Arguments',
      description: 'The arguments to pass to the application',
      type: BuildableTransactionFormFieldType.Array,
      childType: BuildableTransactionFormFieldType.Text,
    } satisfies BuildableTransactionFormField,
    ...feeField,
    ...validRoundsField,
    ...noteField,
  },
  defaultValues: {},
  schema: rawAppCallSchema,
  createTransaction: createRawAppCall,
  type: BuildableTransactionType.AppCall,
} satisfies BuildableTransaction<typeof rawAppCallSchema>
