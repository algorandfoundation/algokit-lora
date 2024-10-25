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
import { Nfd } from '@/features/nfd/data/types'

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

type AddressAndNfd = {
  value: Nfd | Address
  address: Address
}

type CommonBuildTransactionResult = {
  id: string
  sender: AddressAndNfd
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
  receiver: AddressAndNfd
  amount: number
}

export type BuildAccountCloseTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AccountClose
  closeRemainderTo: AddressAndNfd
  receiver?: AddressAndNfd
  amount?: number
}

export type BuildAssetTransferTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: AddressAndNfd
  }
  type: BuildableTransactionType.AssetTransfer
  receiver: AddressAndNfd
  amount: number
}

export type BuildAssetOptInTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: AddressAndNfd
  }
  type: BuildableTransactionType.AssetOptIn
}

export type BuildAssetOptOutTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: AddressAndNfd
  }
  type: BuildableTransactionType.AssetOptOut
  closeRemainderTo: AddressAndNfd
}

export type BuildAssetClawbackTransactionResult = CommonBuildTransactionResult & {
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    clawback?: AddressAndNfd
  }
  type: BuildableTransactionType.AssetClawback
  receiver: AddressAndNfd
  clawbackTarget: AddressAndNfd
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
  manager?: AddressAndNfd
  reserve?: AddressAndNfd
  freeze?: AddressAndNfd
  clawback?: AddressAndNfd
}

export type BuildAssetReconfigureTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AssetReconfigure
  asset: {
    id: AssetId
    decimals?: number
    unitName?: string
    manager?: AddressAndNfd
  }
  manager?: AddressAndNfd
  reserve?: AddressAndNfd
  freeze?: AddressAndNfd
  clawback?: AddressAndNfd
}

export type BuildAssetDestroyTransactionResult = CommonBuildTransactionResult & {
  type: BuildableTransactionType.AssetDestroy
  asset: {
    id: AssetId
  }
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
  | BuildAssetTransferTransactionResult
  | BuildAssetOptInTransactionResult
  | BuildAssetOptOutTransactionResult
  | BuildAssetClawbackTransactionResult
  | BuildAssetCreateTransactionResult
  | BuildAssetReconfigureTransactionResult
  | BuildAssetDestroyTransactionResult
  | BuildMethodCallTransactionResult

export type TransactionPositionsInGroup = Map<string, number>
