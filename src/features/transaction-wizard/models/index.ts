import { z } from 'zod'
import algosdk from 'algosdk'

export enum BuildableTransactionFormFieldType {
  Text = 'Text',
  Account = 'Account',
  AlgoAmount = 'AlgoAmount',
  Fee = 'Fee',
  ValidRounds = 'ValidRounds',
  Number = 'Number',
  Array = 'Array',
}

export type BuildableTransactionFormField =
  | {
      type: Exclude<BuildableTransactionFormFieldType, BuildableTransactionFormFieldType.Array>
      label: string
      description?: string
      placeholder?: string
    }
  | {
      type: BuildableTransactionFormFieldType.Array
      childType: BuildableTransactionFormFieldType
      label: string
      description?: string
      placeholder?: string
    }

export type BuildableTransaction<TSchema extends z.ZodSchema = z.ZodTypeAny, TData = z.infer<TSchema>> = {
  type: BuildableTransactionType
  label: string
  fields: {
    [K in keyof TData]: BuildableTransactionFormField
  }
  defaultValues: Partial<TData>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodEffects<any, TData, unknown>
  createTransaction: (data: TData) => Promise<algosdk.Transaction>
}

export enum BuildableTransactionType {
  Payment,
  AccountClose,
  AppCall,
}
