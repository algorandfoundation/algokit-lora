import { ApplicationId } from '../data/types'
import algosdk from 'algosdk'
import { Method } from '@algorandfoundation/algokit-utils/types/app-arc56'

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
  globalState?: Map<string, ApplicationGlobalStateValue>
  json: string
  isDeleted: boolean
}

export type ApplicationStateSchema = {
  numByteSlice: number
  numUint: number
}

export type ApplicationGlobalStateValue =
  | {
      type: ApplicationGlobalStateType.Bytes
      value: string
    }
  | {
      type: ApplicationGlobalStateType.Uint
      value: number | bigint
    }

export enum ApplicationGlobalStateType {
  Bytes = 'Bytes',
  Uint = 'Uint',
}

export type ApplicationBoxSummary = {
  name: string
}

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
