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
const arrayItemPathSeparator = '.' // This must be a . for react hook form to work
const argumentFieldPath = (methodName: string, argumentIndex: number) => `${methodName}${argumentPathSeparator}${argumentIndex}`
export const extractArgumentIndexFromFieldPath = (path: string) =>
  parseInt(path.split(argumentPathSeparator)[1].split(arrayItemPathSeparator)[0])

const getFieldSchema = (type: algosdk.ABIArgumentType, isOptional: boolean): z.ZodTypeAny => {
  // TODO: confirm isOptional for arrays
  if (type instanceof algosdk.ABIUintType) {
    const max = Math.pow(2, type.bitSize) - 1
    const uintSchema = z.number().min(0).max(max)
    return numberSchema(isOptional ? uintSchema.optional() : uintSchema)
  }
  if (type instanceof algosdk.ABIByteType) {
    return zfd.numeric(z.number().min(0).max(255))
  }
  if (type instanceof algosdk.ABIBoolType) {
    return isOptional ? z.boolean().optional() : z.boolean()
  }
  if (type instanceof algosdk.ABIUfixedType) {
    // TODO: review the max
    const max = Math.pow(2, type.bitSize) - 1
    const precision = type.precision
    const uintfixedSchema = z
      .number()
      .min(0)
      .max(max)
      .refine((n) => n === undefined || n.toString().split('.').length === 1 || n.toString().split('.')[1].length <= precision, {
        message: `Precision must be less than ${precision}`,
      })
    return numberSchema(isOptional ? uintfixedSchema.optional() : uintfixedSchema)
  }
  if (type instanceof algosdk.ABIArrayStaticType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return isOptional ? zfd.text().optional() : zfd.text()
    } else {
      return z.array(getFieldSchema(type.childType, false))
    }
  }
  if (type instanceof algosdk.ABIAddressType) {
    return isOptional ? zfd.text().optional() : zfd.text()
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return isOptional ? zfd.text().optional() : zfd.text()
    } else {
      return z.array(
        z.object({
          id: z.string(),
          child: getFieldSchema(type.childType, false),
        })
      )
    }
  }
  if (type instanceof algosdk.ABIStringType) {
    return isOptional ? zfd.text().optional() : zfd.text()
  }
  if (type instanceof algosdk.ABITupleType) {
    const childTypes = type.childTypes.map((childType) => getFieldSchema(childType, false))
    // TODO: another any :(
    // Looks like it's related to this https://github.com/colinhacks/zod/issues/561
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return z.tuple(childTypes as any)
  }
  if (algosdk.abiTypeIsReference(type)) {
    const min = type === algosdk.ABIReferenceType.asset ? 0 : 1
    return zfd.numeric(z.number().min(min).max(255))
  }
  return zfd.text()
}

const getCreateField = <TData extends Record<string, unknown>>(
  formFieldHelper: FormFieldHelper<TData>,
  type: algosdk.ABIArgumentType,
  path: FieldPath<TData>,
  options?: { prefix?: string; description?: string }
): JSX.Element | undefined => {
  if (type instanceof algosdk.ABIUintType) {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}` as Path<TData>,
      placeholder: options?.description,
    })
  }
  if (type instanceof algosdk.ABIByteType) {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}` as Path<TData>,
      placeholder: options?.description,
    })
  }
  // TODO: checkbox isn't great for undefined bool values
  if (type instanceof algosdk.ABIBoolType) {
    return formFieldHelper.checkboxField({
      label: 'Value',
      field: `${path}` as Path<TData>,
    })
  }
  if (type instanceof algosdk.ABIUfixedType) {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}` as Path<TData>,
      placeholder: options?.description,
      decimalScale: type.precision,
    })
  }
  if (type instanceof algosdk.ABIArrayStaticType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return formFieldHelper.textField({
        label: 'Value',
        field: `${path}` as Path<TData>,
        placeholder: options?.description,
        helpText: 'A Base64 encoded Bytes value',
      })
    } else {
      const prefix = options?.prefix ?? 'Item'
      return formFieldHelper.abiStaticArrayField({
        field: `${path}` as Path<TData>,
        prefix: prefix,
        length: type.staticLength,
        description: options?.description,
        createChildField: (childPrefix, childIndex) =>
          getCreateField(formFieldHelper, type.childType, `${path}${arrayItemPathSeparator}${childIndex}` as FieldPath<TData>, {
            prefix: childPrefix,
          }),
      })
    }
  }
  if (type instanceof algosdk.ABIAddressType) {
    return formFieldHelper.textField({
      label: 'Value',
      field: `${path}` as Path<TData>,
      placeholder: options?.description,
    })
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return formFieldHelper.textField({
        label: 'Value',
        field: `${path}` as Path<TData>,
        placeholder: options?.description,
        helpText: 'A Base64 encoded Bytes value',
      })
    } else {
      const prefix = options?.prefix ?? 'Item'
      return formFieldHelper.abiDynamicArrayField({
        field: `${path}` as Path<TData>,
        description: options?.description,
        prefix: prefix,
        createChildField: (childPrefix, childIndex) =>
          getCreateField(
            formFieldHelper,
            type.childType,
            `${path}${arrayItemPathSeparator}${childIndex}${arrayItemPathSeparator}child` as FieldPath<TData>,
            {
              prefix: childPrefix,
            }
          ),
      })
    }
  }
  if (type instanceof algosdk.ABIStringType) {
    return formFieldHelper.textField({
      label: 'Value',
      field: `${path}` as Path<TData>,
      placeholder: options?.description,
    })
  }
  if (type instanceof algosdk.ABITupleType) {
    const prefix = options?.prefix ?? 'Item'
    return formFieldHelper.abiTupleField({
      field: `${path}` as Path<TData>,
      length: type.childTypes.length,
      prefix: prefix,
      description: options?.description,
      createChildField: (childPrefix, childIndex) =>
        getCreateField(formFieldHelper, type.childTypes[childIndex], `${path}${arrayItemPathSeparator}${childIndex}` as FieldPath<TData>, {
          prefix: childPrefix,
        }),
    })
  }
  if (algosdk.abiTypeIsReference(type)) {
    return formFieldHelper.numberField({
      label: options?.prefix ?? 'Value',
      field: `${path}` as Path<TData>,
      placeholder: options?.description,
    })
  }
  return undefined
}

const getAppCallArg = (type: algosdk.ABIArgumentType, value: unknown): ABIAppCallArg => {
  if (type instanceof algosdk.ABIUintType) {
    return value as ABIAppCallArg
  }
  if (type instanceof algosdk.ABIByteType) {
    return value as ABIAppCallArg
  }
  if (type instanceof algosdk.ABIBoolType) {
    return value as ABIAppCallArg
  }
  if (type instanceof algosdk.ABIUfixedType) {
    return BigInt((value as number) * Math.pow(10, (type as algosdk.ABIUfixedType).precision)) as ABIAppCallArg
  }
  if (type instanceof algosdk.ABIArrayStaticType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return base64ToBytes(value as string) as ABIAppCallArg
    } else {
      return (value as unknown[]).map((item) => getAppCallArg(type.childType, item)) as ABIAppCallArg
    }
  }
  if (type instanceof algosdk.ABIAddressType) {
    return value as ABIAppCallArg
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return base64ToBytes(value as string) as ABIAppCallArg
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (value as any[]).map((item) => getAppCallArg(type.childType, item.child)) as ABIAppCallArg
    }
  }
  if (type instanceof algosdk.ABIStringType) {
    return value as ABIAppCallArg
  }
  if (type instanceof algosdk.ABITupleType) {
    return (value as unknown[]).map((item, index) => getAppCallArg(type.childTypes[index], item)) as ABIAppCallArg
  }
  if (algosdk.abiTypeIsReference(type)) {
    return value as ABIAppCallArg
  }
  return value as ABIAppCallArg
}

const getDefaultValue = (type: algosdk.ABIArgumentType): unknown => {
  if (type instanceof algosdk.ABIUintType) {
    return ''
  }
  if (type instanceof algosdk.ABIArrayStaticType && !(type.childType instanceof algosdk.ABIByteType)) {
    return Array.from({ length: type.staticLength }, () => getDefaultValue(type.childType))
  }
  if (type instanceof algosdk.ABIArrayDynamicType && !(type.childType instanceof algosdk.ABIByteType)) {
    return []
  }
  if (type instanceof algosdk.ABITupleType) {
    return type.childTypes.map((childType) => getDefaultValue(childType))
  }
  return undefined
}

// TODO: fix the render for echo_decimal arg and return value
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
  return {
    createField: (helper) =>
      getCreateField(helper, arg.type, argumentFieldPath(methodName, argIndex) as FieldPath<TData>, {
        description: arg.description,
      }),
    fieldSchema: getFieldSchema(arg.type, isArgOptional),
    defaultValue: getDefaultValue(arg.type),
    getAppCallArg: (value) => getAppCallArg(arg.type, value),
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
