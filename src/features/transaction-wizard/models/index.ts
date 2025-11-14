/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import algosdk from 'algosdk'
import { ApplicationId } from '@/features/applications/data/types'
import { MethodDefinition, ArgumentDefinition, StructDefinition } from '@/features/applications/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'
import React from 'react'
import { Nfd } from '@/features/nfd/data/types'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AbiFormItemValue } from '@/features/abi-methods/models'
import Decimal from 'decimal.js'

export enum BuildableTransactionType {
  // pay
  Payment = 'Payment',
  AccountClose = 'AccountClose',
  // appl
  AppCall = 'AppCall',
  MethodCall = 'MethodCall',
  ApplicationCreate = 'ApplicationCreate',
  ApplicationUpdate = 'ApplicationUpdate',
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
  structs?: StructDefinition
  path: string
  fieldSchema: z.ZodTypeAny
  createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
  getAppCallArg: (arg?: AbiFormItemValue) => algosdk.ABIValue | undefined
}

export type TransactionArgumentField = Omit<ArgumentDefinition, 'type'> & {
  type: algosdk.ABITransactionType
  path: string
  createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
}

export type AddressOrNfd = {
  value: Address | Nfd
  resolvedAddress: Address
}

export type TransactionSender = {
  value: Address | Nfd
  resolvedAddress: Address
  autoPopulated?: boolean
}

type CommonBuildTransactionResult = {
  id: string
  sender: TransactionSender
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
  extraProgramPages?: number
  args: string[]
  accounts?: Address[]
  foreignAssets?: AssetId[]
  foreignApps?: ApplicationId[]
  boxes?: (readonly [ApplicationId, string])[]
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
  appSpec: Arc56Contract
  methodDefinition: MethodDefinition
  extraProgramPages?: number
  methodArgs: MethodCallArg[]
  accounts?: Address[]
  foreignAssets?: AssetId[]
  foreignApps?: ApplicationId[]
  boxes?: (readonly [ApplicationId, string])[]
  onComplete:
    | algosdk.OnApplicationComplete.NoOpOC
    | algosdk.OnApplicationComplete.OptInOC
    | algosdk.OnApplicationComplete.ClearStateOC
    | algosdk.OnApplicationComplete.CloseOutOC
    | algosdk.OnApplicationComplete.DeleteApplicationOC
}

export type BuildApplicationCreateTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.ApplicationCreate
  approvalProgram: string
  clearStateProgram: string
  extraProgramPages?: number
  args: string[]
  globalInts?: number
  globalByteSlices?: number
  localInts?: number
  localByteSlices?: number
  onComplete:
    | algosdk.OnApplicationComplete.NoOpOC
    | algosdk.OnApplicationComplete.OptInOC
    | algosdk.OnApplicationComplete.UpdateApplicationOC
    | algosdk.OnApplicationComplete.DeleteApplicationOC
}

export type BuildApplicationUpdateTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.ApplicationUpdate
  applicationId: ApplicationId
  approvalProgram: string
  clearStateProgram: string
  args: string[]
}

export type MethodCallArg = algosdk.ABIValue | BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction | undefined

export type BuildPaymentTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.Payment
  receiver: AddressOrNfd
  amount: number
}

export type BuildAccountCloseTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AccountClose
  closeRemainderTo: AddressOrNfd
  receiver?: AddressOrNfd
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
  receiver: AddressOrNfd
  amount: Decimal
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
  closeRemainderTo: AddressOrNfd
}

export type BuildAssetClawbackTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: Address
  }
  type: BuildableTransactionType.AssetClawback
  receiver: AddressOrNfd
  clawbackTarget: AddressOrNfd
  amount: Decimal
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
  manager?: AddressOrNfd
  reserve?: AddressOrNfd
  freeze?: AddressOrNfd
  clawback?: AddressOrNfd
}

export type BuildAssetReconfigureTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AssetReconfigure
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    manager?: Address
  }
  manager?: AddressOrNfd
  reserve?: AddressOrNfd
  freeze?: AddressOrNfd
  clawback?: AddressOrNfd
}

export type BuildAssetDestroyTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AssetDestroy
  asset: {
    id: AssetId
    decimals?: number
    manager?: Address
  }
}

export type BuildAssetFreezeTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    freeze?: Address
  }
  freezeTarget: AddressOrNfd
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
  | BuildApplicationCreateTransactionResult
  | BuildApplicationUpdateTransactionResult
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

// Base transaction type for search params. Must have type property.
export type BaseSearchParamTransaction = { type: string } & Record<string, string>
