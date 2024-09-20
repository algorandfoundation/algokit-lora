/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppClientMethodCallParamsArgs, ApplicationId } from '@/features/applications/data/types'
import { MethodDefinition, ArgumentDefinition } from '@/features/applications/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { Address } from 'cluster'
import { DefaultValues } from 'react-hook-form'
import { z } from 'zod'

export type MethodForm = Omit<MethodDefinition, 'arguments'> & {
  arguments: ArgumentField[]
  schema: Record<string, z.ZodType<any>>
  defaultValues: DefaultValues<any> // TODO: PD - default values?
}

export type ArgumentField = ArgumentDefinition & {
  createField: (helper: FormFieldHelper<any>) => JSX.Element | undefined
  getAppCallArg: (arg: unknown) => Promise<AppClientMethodCallParamsArgs>
}

export type AppCallTransactionBuilderResult = {
  applicationId: ApplicationId
  sender: Address
  fees: {
    setAutomatically: boolean
    value?: number
  }
  validRounds: {
    setAutomatically: boolean
    firstValid?: number
    lastValid?: number
  }
  note?: string
  methodName?: string
  methodArgs?: AppClientMethodCallParamsArgs[]
  rawArgs?: string[]
}
