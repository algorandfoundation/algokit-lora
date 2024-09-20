import { AppClientMethodCallParamsArgs, ApplicationId } from '../data/types'
import algosdk from 'algosdk'
import { DefaultArgument, Struct as StructType } from '@/features/app-interfaces/data/types/arc-32/application'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { DefaultValues } from 'react-hook-form'

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

export type ArgumentHint = {
  struct?: StructType
  defaultArgument?: DefaultArgument
}

export type ArgumentDefinition = {
  name?: string
  description?: string
  type: algosdk.ABIArgumentType
  hint?: ArgumentHint
}

export type ReturnsHint = {
  struct: StructType
}

export type ReturnsDefinition = {
  description?: string
  type: algosdk.ABIReturnType
  hint?: ReturnsHint
}

export type ApplicationAbiMethods = {
  appSpec?: Arc32AppSpec
  methods: MethodDefinition[]
}

export type MethodDefinition = {
  name: string
  signature: string
  description?: string
  arguments: ArgumentDefinition[]
  returns: ReturnsDefinition
}

// TODO: Name {X}FormDefinition ??
export type MethodFormDefinition<TSchema extends z.ZodSchema, TData = z.infer<TSchema>> = {
  name: string
  signature: string
  description?: string
  arguments: ArgumentFormDefinition<TSchema>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodEffects<any, TData, unknown>
  defaultValues: DefaultValues<TData>
  returns: ReturnsDefinition
}

export type ArgumentFormDefinition<TSchema extends z.ZodSchema> = {
  name?: string
  description?: string
  type: algosdk.ABIArgumentType
  hint?: ArgumentHint
  createField: (helper: FormFieldHelper<z.infer<TSchema>>) => JSX.Element | undefined
  getAppCallArg: (arg: unknown) => Promise<AppClientMethodCallParamsArgs>
}
