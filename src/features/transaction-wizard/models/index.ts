/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import algosdk from 'algosdk'
import { ApplicationId } from '@/features/applications/data/types'
import { MethodDefinition, ArgumentDefinition } from '@/features/applications/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'
import React from 'react'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'

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
  // afrz
  AssetFreeze = 'AssetFreeze',
  // keyreg
  KeyRegistration = 'KeyRegistration',
  // placeholder
  Placeholder = 'Placeholder',
  Fulfilled = 'Fulfilled',
}

export type MethodForm = Omit<MethodDefinition, 'arguments'> & {
  abiMethod: algosdk.ABIMethod
  arguments: (ArgumentField | TransactionArgumentField)[]
  schema: Record<string, z.ZodType<any>>
}

export type ArgumentField = Omit<ArgumentDefinition, 'type'> & {
  type: algosdk.ABIType | algosdk.ABIReferenceType
  path: string
  fieldSchema: z.ZodTypeAny
  createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
  getAppCallArg: (arg: unknown) => algosdk.ABIValue
}

export type TransactionArgumentField = Omit<ArgumentDefinition, 'type'> & {
  type: algosdk.ABITransactionType
  path: string
  createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
}

type CommonBuildTransactionResult = {
  id: string
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
  type: BuildableTransactionType.AppCall
  applicationId: ApplicationId
  args: string[]
  accounts?: Address[]
  foreignAssets?: AssetId[]
  foreignApps?: ApplicationId[]
  boxes?: string[]
  onComplete:
    | algosdk.OnApplicationComplete.NoOpOC
    | algosdk.OnApplicationComplete.OptInOC
    | algosdk.OnApplicationComplete.ClearStateOC
    | algosdk.OnApplicationComplete.CloseOutOC
    | algosdk.OnApplicationComplete.DeleteApplicationOC
}

export type BuildMethodCallTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.MethodCall
  applicationId: ApplicationId
  appSpec: Arc32AppSpec
  method: algosdk.ABIMethod
  methodArgs: MethodCallArg[]
  accounts?: Address[]
  foreignAssets?: AssetId[]
  foreignApps?: ApplicationId[]
  boxes?: string[]
  onComplete:
    | algosdk.OnApplicationComplete.NoOpOC
    | algosdk.OnApplicationComplete.OptInOC
    | algosdk.OnApplicationComplete.ClearStateOC
    | algosdk.OnApplicationComplete.CloseOutOC
    | algosdk.OnApplicationComplete.DeleteApplicationOC
}

export type MethodCallArg = algosdk.ABIValue | BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction

export type BuildPaymentTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.Payment
  receiver: Address
  amount: number
}

export type BuildAccountCloseTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AccountClose
  closeRemainderTo: Address
  receiver?: Address
  amount?: number
}

export type BuildAssetTransferTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: Address
  }
  type: BuildableTransactionType.AssetTransfer
  receiver: Address
  amount: number
}

export type BuildAssetOptInTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: Address
  }
  type: BuildableTransactionType.AssetOptIn
}

export type BuildAssetOptOutTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: Address
  }
  type: BuildableTransactionType.AssetOptOut
  closeRemainderTo: Address
}

export type BuildAssetClawbackTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: Address
  }
  type: BuildableTransactionType.AssetClawback
  receiver: Address
  clawbackTarget: Address
  amount: number
}

export type BuildAssetCreateTransactionResult = CommonBuildTransactionResult & {
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
  type: BuildableTransactionType.AssetReconfigure
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    manager?: Address
  }
  manager?: Address
  reserve?: Address
  freeze?: Address
  clawback?: Address
}

export type BuildAssetDestroyTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AssetDestroy
  asset: {
    id: AssetId
  }
}

export type BuildAssetFreezeTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    freeze?: Address
  }
  freezeTarget: Address
  type: BuildableTransactionType.AssetFreeze
  frozen: boolean
}

export type BuildKeyRegistrationTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.KeyRegistration
  online: boolean
  voteKey?: string
  selectionKey?: string
  voteFirstValid?: bigint
  voteLastValid?: bigint
  voteKeyDilution?: bigint
  stateProofKey?: string
}

export type PlaceholderTransaction = {
  id: string
  type: BuildableTransactionType.Placeholder
  targetType: algosdk.ABITransactionType
}

export type FulfilledByTransaction = {
  id: string
  type: BuildableTransactionType.Fulfilled
  targetType: algosdk.ABITransactionType
  fulfilledById: string
}

export type BuildTransactionResult =
  | BuildPaymentTransactionResult
  | BuildAccountCloseTransactionResult
  | BuildAppCallTransactionResult
  | BuildMethodCallTransactionResult
  | BuildAssetTransferTransactionResult
  | BuildAssetOptInTransactionResult
  | BuildAssetOptOutTransactionResult
  | BuildAssetClawbackTransactionResult
  | BuildAssetCreateTransactionResult
  | BuildAssetReconfigureTransactionResult
  | BuildAssetDestroyTransactionResult
  | BuildAssetFreezeTransactionResult
  | BuildKeyRegistrationTransactionResult

export type TransactionPositionsInGroup = Map<string, number>
