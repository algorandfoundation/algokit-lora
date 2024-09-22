/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import algosdk from 'algosdk'
import { ApplicationId } from '@/features/applications/data/types'
import { MethodDefinition, ArgumentDefinition } from '@/features/applications/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { DefaultValues } from 'react-hook-form'
import { Address } from '@/features/accounts/data/types'
import { TransactionsGraphData } from '@/features/transactions-graph'

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

export type MethodForm = Omit<MethodDefinition, 'arguments'> & {
  abiMethod: algosdk.ABIMethod
  arguments: ArgumentField[]
  schema: Record<string, z.ZodType<any>>
  defaultValues: DefaultValues<any> // TODO: PD - default values?
}

export type ArgumentField = ArgumentDefinition & {
  createField: (helper: FormFieldHelper<any>) => JSX.Element | undefined
  getAppCallArg: (arg: unknown) => Promise<MethodCallTransactionArg>
}

// TODO: PD - extract the common fields into a base type
export type AppCallTransactionBuilderResult = {
  type: BuildableTransactionType.AppCall
  applicationId: ApplicationId
  sender: Address
  fee: {
    setAutomatically: boolean
    value?: number
  }
  validRounds: {
    setAutomatically: boolean
    firstValid?: bigint
    lastValid?: bigint
  }
  note?: string
  method?: algosdk.ABIMethod
  methodName?: string
  methodArgs?: MethodCallTransactionArg[]
  rawArgs?: string[]
}

export type MethodCallTransactionArg = algosdk.ABIValue | TransactionBuilderResult

export type PaymentTransactionBuilderResult = {
  type: BuildableTransactionType.Payment
  sender: Address
  receiver: Address
  amount: number
  note?: string
  fee: {
    setAutomatically: boolean
    value?: number
  }
  validRounds: {
    setAutomatically: boolean
    firstValid?: bigint
    lastValid?: bigint
  }
}

export type TransactionBuilderResult = PaymentTransactionBuilderResult | AppCallTransactionBuilderResult

export type SendTransactionResult = {
  transactionId: string
  transactionsGraphData: TransactionsGraphData
}
