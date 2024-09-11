import { z, ZodEffects } from 'zod'
import algosdk from 'algosdk'

export enum BuildableTransactionFormFieldType {
  Text = 'Text',
  Account = 'Account',
  AlgoAmount = 'AlgoAmount',
  Fee = 'Fee',
  ValidRounds = 'ValidRounds',
  AssetId = 'assetId',
}

export type BuildableTransactionFormField = {
  type: BuildableTransactionFormFieldType
  label: string
  description?: string
  placeholder?: string
}

export type BuildableTransaction<TSchema extends z.ZodSchema, TData = z.infer<TSchema>> = {
  label: string
  fields: {
    [K in keyof TData]: BuildableTransactionFormField
  }
  defaultValues: Partial<TData>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodEffects<any, TData, unknown>
  createTransaction: (data: TData) => Promise<algosdk.Transaction>
}
