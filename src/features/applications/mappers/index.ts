import {
  Application,
  ApplicationAbiMethods,
  ApplicationGlobalStateType,
  ApplicationGlobalStateValue,
  ApplicationSummary,
  ArgumentDefinition,
  ArgumentHint,
  MethodDefinition,
} from '../models'
import { encodeAddress, getApplicationAddress, modelsv2 } from 'algosdk'
import isUtf8 from 'isutf8'
import { Buffer } from 'buffer'
import { ApplicationMetadataResult, ApplicationResult } from '../data/types'
import { asJson } from '@/utils/as-json'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import algosdk from 'algosdk'
import { isArc32AppSpec } from '@/features/common/utils'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { Path } from 'react-hook-form'
import { numberSchema } from '@/features/forms/data/common'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'

export const asApplicationSummary = (application: ApplicationResult): ApplicationSummary => {
  return {
    id: application.id,
  }
}

export const asApplication = (application: ApplicationResult, metadata: ApplicationMetadataResult): Application => {
  return {
    id: application.id,
    name: metadata?.name,
    creator: application.params.creator,
    account: getApplicationAddress(application.id),
    globalStateSchema: application.params['global-state-schema']
      ? {
          numByteSlice: application.params['global-state-schema']['num-byte-slice'],
          numUint: application.params['global-state-schema']['num-uint'],
        }
      : undefined,
    localStateSchema: application.params['local-state-schema']
      ? {
          numByteSlice: application.params['local-state-schema']['num-byte-slice'],
          numUint: application.params['local-state-schema']['num-uint'],
        }
      : undefined,
    approvalProgram: application.params['approval-program'],
    clearStateProgram: application.params['clear-state-program'],
    globalState: asGlobalStateValue(application.params['global-state']),
    isDeleted: application.deleted ?? false,
    json: asJson(application),
  }
}

export const asGlobalStateValue = (globalState: ApplicationResult['params']['global-state']): Application['globalState'] => {
  if (!globalState) {
    return
  }

  return new Map(
    globalState
      .map(({ key, value }) => {
        return [getKey(key), getGlobalStateValue(value)] as const
      })
      .sort((a, b) => a[0].localeCompare(b[0]))
  )
}

const getKey = (key: string): string => {
  const buffer = Buffer.from(key, 'base64')

  if (isUtf8(buffer)) {
    return buffer.toString()
  } else {
    return `0x${buffer.toString('hex')}`
  }
}

const getGlobalStateValue = (tealValue: modelsv2.TealValue): ApplicationGlobalStateValue => {
  if (tealValue.type === 1) {
    return {
      type: ApplicationGlobalStateType.Bytes,
      value: getValue(tealValue.bytes),
    }
  }
  if (tealValue.type === 2) {
    return {
      type: ApplicationGlobalStateType.Uint,
      value: tealValue.uint,
    }
  }
  throw new Error(`Unknown type ${tealValue.type}`)
}

const getValue = (bytes: string) => {
  const buf = Buffer.from(bytes, 'base64')
  if (buf.length === 32) {
    return encodeAddress(new Uint8Array(buf))
  } else {
    if (isUtf8(buf)) {
      return buf.toString('utf8')
    } else {
      return buf.toString('base64')
    }
  }
}

const argumentPathSeperator = '-'
const argumentFieldPath = (methodName: string, argumentIndex: number) => `${methodName}${argumentPathSeperator}${argumentIndex}`
export const extractArgumentIndexFromFieldPath = (path: string) => parseInt(path.split(argumentPathSeperator)[1])

const uintSchema = z.number().min(0).max(255)
const asField = <TData extends Record<string, unknown>>(
  methodName: string,
  arg: algosdk.ABIMethod['args'][number],
  argIndex: number,
  isArgOptional: boolean
): { createField: (helper: FormFieldHelper<TData>) => JSX.Element | undefined; fieldSchema: z.ZodTypeAny } => {
  if (arg.type instanceof algosdk.ABIUintType) {
    return {
      createField: (helper) => {
        return helper.numberField({
          label: 'Value',
          field: argumentFieldPath(methodName, argIndex) as Path<TData>,
          placeholder: arg.description,
        })
      },
      fieldSchema: numberSchema(isArgOptional ? uintSchema.optional() : uintSchema),
    }
  }

  return {
    createField: () => undefined,
    fieldSchema: zfd.text(),
  }
}

export const asApplicationAbiMethods = <TSchema extends z.ZodSchema>(
  appSpec: Arc32AppSpec | Arc4AppSpec
): ApplicationAbiMethods<TSchema> => {
  const isArc32 = isArc32AppSpec(appSpec)
  const contract = isArc32 ? appSpec.contract : appSpec
  const methods = contract.methods.map((method) => {
    const abiMethod = new algosdk.ABIMethod({
      name: method.name,
      desc: method.desc,
      args: method.args,
      returns: method.returns,
    })
    const signature = abiMethod.getSignature()
    const hint = isArc32AppSpec(appSpec) && appSpec.hints ? appSpec.hints[signature] : undefined

    const [methodArgs, schema] = abiMethod.args.reduce(
      (acc, arg, i) => {
        const { createField, fieldSchema } = asField(method.name, arg, i, !!(arg.name && hint?.default_arguments?.[arg.name]))

        const argument = {
          name: arg.name,
          description: arg.description,
          type: arg.type,
          hint:
            hint && arg.name && (hint.structs?.[arg.name] || hint.default_arguments?.[arg.name])
              ? ({
                  struct: hint.structs?.[arg.name],
                  defaultArgument: hint.default_arguments?.[arg.name],
                } satisfies ArgumentHint)
              : undefined,
          createField,
        } satisfies ArgumentDefinition<TSchema>
        acc[0].push(argument)
        acc[1] = {
          ...acc[1],
          [argumentFieldPath(method.name, i)]: fieldSchema,
        }
        return acc
      },
      [[] as ArgumentDefinition<TSchema>[], {} as Record<string, z.ZodTypeAny>] as const
    )

    return {
      name: abiMethod.name,
      signature: signature,
      description: abiMethod.description,
      arguments: methodArgs,
      returns: {
        ...abiMethod.returns,
        hint:
          hint && hint.structs?.['output']
            ? {
                struct: hint.structs?.['output'],
              }
            : undefined,
      },
      schema: zfd.formData(schema),
    } satisfies MethodDefinition<TSchema>
  })

  return {
    ...(isArc32
      ? {
          type: 'arc32',
          appSpec: appSpec,
        }
      : {
          type: 'arc4',
          appSpec: appSpec,
        }),
    methods,
  }
}
