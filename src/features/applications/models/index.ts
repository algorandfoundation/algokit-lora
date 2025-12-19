import { ApplicationId } from '../data/types'
import { ABIMethodArgType, ABIMethod, ABIMethodReturnType, ABIType, Arc56Contract, Arc56Method } from '@algorandfoundation/algokit-utils/abi'
import { DecodedAbiStorageKey, DecodedAbiStorageKeyType, DecodedAbiStorageValue } from '@/features/abi-methods/models'
import { OnApplicationComplete } from '@algorandfoundation/algokit-utils/transact'

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

export type StructFieldType = ABIType | StructFieldDefinition[]

export type StructFieldDefinition = {
  name: string
  type: StructFieldType
}

export type StructDefinition = {
  name: string
  fields: StructFieldDefinition[]
}

export type DefaultArgument = NonNullable<Arc56Method['args'][number]['defaultValue']>

export type ArgumentDefinition = {
  name?: string
  description?: string
  type: ABIMethodArgType
  struct?: StructDefinition
  defaultArgument?: DefaultArgument
}

export type ReturnsDefinition = {
  description?: string
  type: ABIMethodReturnType
  struct?: StructDefinition
}

export type MethodDefinition = {
  name: string
  signature: string
  description?: string
  abiMethod: ABIMethod
  callConfig?: {
    call: OnApplicationComplete[]
    create: OnApplicationComplete[]
  }
  arguments: ArgumentDefinition[]
  returns: ReturnsDefinition
}
