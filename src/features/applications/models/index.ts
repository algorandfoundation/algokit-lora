import { ApplicationId } from '../data/types'
import algosdk from 'algosdk'
import { Arc56Contract, Method } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { DecodedAbiStorageKey, DecodedAbiStorageKeyType, DecodedAbiStorageValue } from '@/features/abi-methods/models'

export type ApplicationSummary = {
  id: ApplicationId
}

export type Application = {
  id: ApplicationId
  name?: string
  account: string
  creator: string
  globalStateSchema?: ApplicationStateSchema
  localStateSchema?: ApplicationStateSchema
  approvalProgram: string
  clearStateProgram: string
  globalState?: ApplicationState[]
  json: string
  isDeleted: boolean
  appSpec?: Arc56Contract
}

export type ApplicationStateSchema = {
  numByteSlice: number
  numUint: number
}

export type ApplicationState = RawApplicationState | DecodedApplicationState

export type RawApplicationState =
  | {
      key: string
      type: RawApplicationStateType.Bytes
      value: string
    }
  | {
      key: string
      type: RawApplicationStateType.Uint
      value: number | bigint
    }

export type DecodedApplicationState = {
  key: DecodedAbiStorageKey
  value: DecodedAbiStorageValue
}

export enum RawApplicationStateType {
  Bytes = 'Bytes',
  Uint = 'Uint',
}

export type BoxDescriptor = RawBoxDescriptor | DecodedBoxDescriptor

export type RawBoxDescriptor = {
  base64Name: string
  name: string
}

export type DecodedBoxDescriptor = {
  base64Name: string
  name: string
  prefix?: string
  valueType: string
  type: DecodedAbiStorageKeyType
} & DecodedAbiStorageValue

export type ApplicationBox = {
  name: string
  value: string
}

export type StructFieldType = algosdk.ABIType | StructFieldDefinition[]

export type StructFieldDefinition = {
  name: string
  type: StructFieldType
}

export type StructDefinition = {
  name: string
  fields: StructFieldDefinition[]
}

export type DefaultArgument = NonNullable<Method['args'][number]['defaultValue']>

export type ArgumentDefinition = {
  name?: string
  description?: string
  type: algosdk.ABIArgumentType
  struct?: StructDefinition
  defaultArgument?: DefaultArgument
}

export type ReturnsDefinition = {
  description?: string
  type: algosdk.ABIReturnType
  struct?: StructDefinition
}

export type MethodDefinition = {
  name: string
  signature: string
  description?: string
  abiMethod: algosdk.ABIMethod
  callConfig?: {
    call: algosdk.OnApplicationComplete[]
    create: algosdk.OnApplicationComplete[]
  }
  arguments: ArgumentDefinition[]
  returns: ReturnsDefinition
}
