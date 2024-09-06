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
import { DefaultValues, FieldPath, Path } from 'react-hook-form'
import { numberSchema } from '@/features/forms/data/common'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { ABIAppCallArg } from '@algorandfoundation/algokit-utils/types/app'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { DynamicArrayFormItem } from '@/features/applications/components/dynamic-array-form-item'
import { StaticArrayFormItem } from '@/features/applications/components/static-array-form-item'
import { TupleFormItem } from '@/features/applications/components/tupleFormItem'

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

const argumentPathSeparator = '-'
const argumentFieldPath = (methodName: string, argumentIndex: number) => `${methodName}${argumentPathSeparator}${argumentIndex}`
export const extractArgumentIndexFromFieldPath = (path: string) => parseInt(path.split(argumentPathSeparator)[1])

const getFieldSchema = (type: algosdk.ABIType | algosdk.ABIReferenceType, isOptional: boolean): z.ZodTypeAny => {
  if (algosdk.abiTypeIsReference(type)) {
    const min = type === algosdk.ABIReferenceType.asset ? 0 : 1
    return zfd.numeric(z.number().min(min).max(255))
  }
  if (type instanceof algosdk.ABIUintType) {
    const max = Math.pow(2, type.bitSize) - 1
    const uintSchema = z.number().min(0).max(max)
    return numberSchema(isOptional ? uintSchema.optional() : uintSchema)
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    return z.array(getFieldSchema(type.childType, false))
  }
  if (type instanceof algosdk.ABIArrayStaticType) {
    return z.array(getFieldSchema(type.childType, false))
  }
  if (type instanceof algosdk.ABITupleType) {
    const childTypes = type.childTypes.map((childType) => getFieldSchema(childType, false))
    // TODO: another any :(
    // Looks like it's related to this https://github.com/colinhacks/zod/issues/561
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return z.tuple(childTypes as any)
  }

  return zfd.text()
}

const createFieldBuilder = <TData extends Record<string, unknown>>(
  type: algosdk.ABIType | algosdk.ABIReferenceType,
  path: FieldPath<TData>,
  options?: { label?: string; description?: string }
): ((helper: FormFieldHelper<TData>) => JSX.Element | undefined) => {
  if (type instanceof algosdk.ABIArrayDynamicType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return (helper) =>
        helper.textField({
          label: options?.label ?? 'Value',
          field: `${path}` as Path<TData>,
          placeholder: options?.description,
          helpText: 'A Base64 encoded Bytes value',
        })
    } else {
      return (helper) => {
        return (
          <DynamicArrayFormItem
            field={path}
            helper={helper}
            description={options?.description}
            createChildField={(childIndex) =>
              createFieldBuilder(type.childType, `${path}.${childIndex}` as FieldPath<TData>, { label: `Item ${childIndex + 1}` })
            }
          />
        )
      }
    }
  }

  if (type instanceof algosdk.ABIArrayStaticType) {
    return (helper) => {
      return (
        <StaticArrayFormItem
          helper={helper}
          length={type.staticLength}
          createChildField={(childIndex) =>
            createFieldBuilder(type.childType, `${path}.${childIndex}` as FieldPath<TData>, { label: `Item ${childIndex + 1}` })
          }
        />
      )
    }
  }

  if (type instanceof algosdk.ABITupleType) {
    // TODO: review UI for tuples
    return (helper) => {
      return (
        <TupleFormItem
          helper={helper}
          length={type.childTypes.length}
          createChildField={(childIndex) =>
            createFieldBuilder(type.childTypes[childIndex], `${path}.${childIndex}` as FieldPath<TData>, {
              label: `Item ${childIndex + 1}`,
            })
          }
        />
      )
    }
  }

  if (type instanceof algosdk.ABIUintType) {
    return (helper) =>
      helper.numberField({
        label: options?.label ?? 'Value',
        field: `${path}` as Path<TData>,
        placeholder: options?.description,
      })
  }

  if (type instanceof algosdk.ABIStringType) {
    return (helper) =>
      helper.textField({
        label: options?.label ?? 'Value',
        field: `${path}` as Path<TData>,
        placeholder: options?.description,
      })
  }

  return () => undefined
}

const asField = <TData extends Record<string, unknown>>(
  methodName: string,
  arg: algosdk.ABIMethod['args'][number],
  argIndex: number,
  isArgOptional: boolean
): {
  createField: (helper: FormFieldHelper<TData>) => JSX.Element | undefined
  fieldSchema: z.ZodTypeAny
  defaultValue?: unknown // TODO: NC - Can we do better with the type here?
  getAppCallArg: (value: unknown) => ABIAppCallArg
} => {
  if (arg.type instanceof algosdk.ABIArrayDynamicType && arg.type.childType instanceof algosdk.ABIByteType) {
    return {
      createField: createFieldBuilder(arg.type, `${methodName}-${argIndex}` as FieldPath<TData>, { description: arg.description }),
      fieldSchema: getFieldSchema(arg.type, isArgOptional),
      getAppCallArg: (value) => base64ToBytes(value as string) as ABIAppCallArg,
      defaultValue: '' as unknown as undefined,
    }
  }

  if (
    arg.type instanceof algosdk.ABIUintType ||
    arg.type instanceof algosdk.ABIArrayDynamicType ||
    arg.type instanceof algosdk.ABIArrayStaticType ||
    arg.type instanceof algosdk.ABITupleType
  ) {
    return {
      createField: createFieldBuilder(arg.type, `${methodName}-${argIndex}` as FieldPath<TData>, { description: arg.description }),
      fieldSchema: getFieldSchema(arg.type, isArgOptional),
      defaultValue: '' as unknown as undefined,
      getAppCallArg: (value) => value as ABIAppCallArg,
    }
  }

  return {
    createField: () => undefined,
    fieldSchema: zfd.text(),
    getAppCallArg: (value) => value as ABIAppCallArg,
  }
}

export const asApplicationAbiMethods = <TSchema extends z.ZodSchema>(
  appSpec: Arc32AppSpec | Arc4AppSpec
): ApplicationAbiMethods<TSchema> => {
  type TData = z.infer<TSchema>
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

    const [methodArgs, schema, defaultValues] = abiMethod.args.reduce(
      (acc, arg, i) => {
        const { createField, fieldSchema, defaultValue, getAppCallArg } = asField(
          method.name,
          arg,
          i,
          !!(arg.name && hint?.default_arguments?.[arg.name])
        )

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
          getAppCallArg,
        } satisfies ArgumentDefinition<TSchema>

        const fieldPath = argumentFieldPath(method.name, i)
        acc[0].push(argument)
        acc[1] = {
          ...acc[1],
          [fieldPath]: fieldSchema,
        }
        if (defaultValue !== undefined) {
          acc[2] = {
            ...acc[2],
            [fieldPath]: defaultValue,
          }
        }
        return acc
      },
      [[] as ArgumentDefinition<TSchema>[], {} as Record<string, z.ZodTypeAny>, {} as DefaultValues<TData>] as const
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
      defaultValues,
    } satisfies MethodDefinition<TSchema>
  })

  return {
    appSpec: isArc32 ? appSpec : undefined,
    methods,
  }
}
