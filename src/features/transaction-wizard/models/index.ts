import { ZodSchema, ZodEffects, infer as zodInfer } from 'zod'
import algosdk from 'algosdk'

export enum BuildableTransactionFormFieldType {
  Text = 'Text',
  Account = 'Account',
  AlgoAmount = 'AlgoAmount',
  Fee = 'Fee',
  ValidRounds = 'ValidRounds',
}

export type BuildableTransactionFormField = {
  type: BuildableTransactionFormFieldType
  label: string
  description?: string
  placeholder?: string
}

export type BuildableTransaction<T extends ZodSchema> = {
  label: string
  fields: {
    [K in keyof zodInfer<T>]: BuildableTransactionFormField
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodEffects<any, zodInfer<T>, unknown>
  createTransaction: (data: zodInfer<T>) => Promise<algosdk.Transaction>
}
