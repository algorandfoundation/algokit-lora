/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import algosdk from 'algosdk'
import { ApplicationId } from '@/features/applications/data/types'
import { MethodDefinition, ArgumentDefinition } from '@/features/applications/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { DefaultValues } from 'react-hook-form'
import { Address } from '@/features/accounts/data/types'
import { TransactionsGraphData } from '@/features/transactions-graph'
import { AssetId } from '@/features/assets/data/types'

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
  // pay
  Payment = 'Payment',
  AccountClose = 'AccountClose',
  // appl
  AppCall = 'AppCall',
  MethodCall = 'MethodCall',
  // axfer
  AssetOptIn = 'AssetOptIn',
  AssetOptOut = 'AssetOptOut',
  AssetTransfer = 'AssetTransfer',
  AssetClawback = 'AssetClawback',
  // acfg
  AssetCreate = 'AssetCreate',
  AssetReconfigure = 'AssetReconfigure',
  AssetDestroy = 'AssetDestroy',
}

export type MethodForm = Omit<MethodDefinition, 'arguments'> & {
  abiMethod: algosdk.ABIMethod
  arguments: ArgumentField[]
  schema: Record<string, z.ZodType<any>>
  defaultValues: DefaultValues<any> // TODO: PD - default values?
}

export type ArgumentField = ArgumentDefinition & {
  createField: (helper: FormFieldHelper<any>) => JSX.Element | undefined
  getAppCallArg: (arg: unknown) => Promise<MethodCallArg>
}

type CommonBuildTransactionResult = {
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
}

export type BuildAppCallTransactionResult = CommonBuildTransactionResult & {
  id: string
  type: BuildableTransactionType.AppCall
  applicationId: ApplicationId
  args: string[]
  accounts?: Address[]
  foreignAssets?: AssetId[]
  foreignApps?: ApplicationId[]
  boxes?: string[]
}

export type BuildMethodCallTransactionResult = CommonBuildTransactionResult & {
  id: string
  type: BuildableTransactionType.MethodCall
  applicationId: ApplicationId
  method: algosdk.ABIMethod
  methodName: string
  methodArgs: MethodCallArg[]
  accounts?: Address[]
  foreignAssets?: AssetId[]
  foreignApps?: ApplicationId[]
  boxes?: string[]
}

export type MethodCallArg = algosdk.ABIValue | BuildTransactionResult

export type BuildPaymentTransactionResult = CommonBuildTransactionResult & {
  id: string
  type: BuildableTransactionType.Payment
  receiver: Address
  amount: number
}

export type BuildAssetTransferTransactionResult = CommonBuildTransactionResult & {
  id: string // TODO: NC - Feels like this is meant to be common?
  asset: {
    id: AssetId
    decimals?: number
    clawback?: Address
  }
  type: BuildableTransactionType.AssetTransfer
  receiver: Address
  amount: number
}

export type BuildAssetOptInTransactionResult = CommonBuildTransactionResult & {
  id: string
  asset: {
    id: AssetId
    decimals?: number
    clawback?: Address
  }
  type: BuildableTransactionType.AssetOptIn
}

export type BuildAssetOptOutTransactionResult = CommonBuildTransactionResult & {
  id: string
  asset: {
    id: AssetId
    decimals?: number
    clawback?: Address
  }
  type: BuildableTransactionType.AssetOptOut
  closeRemainderTo: Address
}

export type BuildAssetClawbackTransactionResult = CommonBuildTransactionResult & {
  id: string
  asset: {
    id: AssetId
    decimals?: number
    clawback?: Address
  }
  type: BuildableTransactionType.AssetClawback
  receiver: Address
  clawbackTarget: Address
  amount: number
}

export type BuildAssetCreateTransactionResult = CommonBuildTransactionResult & {
  id: string
  type: BuildableTransactionType.AssetCreate
  total: bigint
  decimals: number
  assetName?: string
  unitName?: string
  url?: string
  metadataHash?: string
  defaultFrozen: boolean
  manager?: Address
  reserve?: Address
  freeze?: Address
  clawback?: Address
}

export type BuildAssetReconfigureTransactionResult = CommonBuildTransactionResult & {
  id: string
  type: BuildableTransactionType.AssetReconfigure
  asset: {
    id: AssetId
    decimals?: number
    manager?: Address
  }
  manager?: Address
  reserve?: Address
  freeze?: Address
  clawback?: Address
}

export type BuildAssetDestroyTransactionResult = CommonBuildTransactionResult & {
  id: string
  type: BuildableTransactionType.AssetDestroy
  asset: {
    id: AssetId
  }
}

export type BuildTransactionResult =
  | BuildPaymentTransactionResult
  | BuildAppCallTransactionResult
  | BuildAssetTransferTransactionResult
  | BuildAssetOptInTransactionResult
  | BuildAssetOptOutTransactionResult
  | BuildAssetClawbackTransactionResult
  | BuildAssetCreateTransactionResult
  | BuildAssetReconfigureTransactionResult
  | BuildAssetDestroyTransactionResult
  | BuildMethodCallTransactionResult

export type SendTransactionResult = {
  transactionId: string
  transactionsGraphData: TransactionsGraphData
}
