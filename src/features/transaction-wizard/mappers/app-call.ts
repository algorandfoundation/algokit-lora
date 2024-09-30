/* eslint-disable @typescript-eslint/no-explicit-any */
import algosdk from 'algosdk'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { FieldPath, Path } from 'react-hook-form'
import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { addressFieldSchema } from '@/features/transaction-wizard/data/common'
import {
  ArgumentField,
  MethodCallArg,
  MethodForm,
  BuildTransactionResult,
  TransactionArgumentField,
} from '@/features/transaction-wizard/models'
import { ArgumentDefinition, ArgumentHint, MethodDefinition } from '@/features/applications/models'

const argumentPathSeparator = '-'
const arrayItemPathSeparator = '.' // This must be a . for react hook form to work
export const methodArgPrefix = 'methodArg'

const argumentFieldPath = (argumentIndex: number) => `${methodArgPrefix}${argumentPathSeparator}${argumentIndex}`
export const extractArgumentIndexFromFieldPath = (path: string) =>
  parseInt(path.split(argumentPathSeparator)[1].split(arrayItemPathSeparator)[0])

const getFieldSchema = (type: algosdk.ABIArgumentType, isOptional: boolean): z.ZodTypeAny => {
  if (type instanceof algosdk.ABIUintType) {
    const max = BigInt(2 ** type.bitSize) - BigInt(1)
    const uintSchema = z.bigint().min(BigInt(0)).max(max)
    return bigIntSchema(isOptional ? uintSchema.optional() : uintSchema)
  }
  if (type instanceof algosdk.ABIByteType) {
    const uintSchema = z.number().min(0).max(255)
    return numberSchema(isOptional ? uintSchema.optional() : uintSchema)
  }
  if (type instanceof algosdk.ABIBoolType) {
    const boolSchema = z
      .string()
      .toLowerCase()
      .transform((text) => JSON.parse(text))
      .pipe(z.boolean())
    return isOptional ? boolSchema.optional() : boolSchema
  }
  if (type instanceof algosdk.ABIUfixedType) {
    const max = BigInt(2 ** type.bitSize) - BigInt(1)
    const stringSchema = isOptional ? z.string().optional() : z.string()

    return zfd.text(
      stringSchema
        .refine((s) => s === undefined || s.split('.').length === 1 || s.split('.')[1].length <= type.precision, {
          message: `Decimal precision must be less than ${type.precision}`,
        })
        .refine(
          (s) => s === undefined || fixedPointDecimalStringToBigInt(s, type.precision) <= max,
          (s) => ({
            message: `The value ${s} is too big to fit in type ${type.toString()}`,
          })
        )
    )
  }
  if (type instanceof algosdk.ABIArrayStaticType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return isOptional ? zfd.text().optional() : zfd.text()
    } else {
      return z.array(getFieldSchema(type.childType, false)).min(type.staticLength).max(type.staticLength)
    }
  }
  if (type instanceof algosdk.ABIAddressType) {
    return isOptional ? addressFieldSchema.optional() : addressFieldSchema
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
    return z.tuple(childTypes as [z.ZodTypeAny, ...z.ZodTypeAny[]])
  }
  if (type === algosdk.ABIReferenceType.asset || type === algosdk.ABIReferenceType.application) {
    return numberSchema(z.number().min(0))
  }
  if (type === algosdk.ABIReferenceType.account) {
    return addressFieldSchema
  }
  if (algosdk.abiTypeIsReference(type)) {
    const min = type === algosdk.ABIReferenceType.asset ? 0 : 1
    return numberSchema(z.number().min(min).max(255))
  }
  if (algosdk.abiTypeIsTransaction(type)) {
    return z.any().refine(
      (data) => {
        return isOptional || data
      },
      {
        message: 'Required',
      }
    )
  }
  return zfd.text()
}

const getCreateField = (
  formFieldHelper: FormFieldHelper<any>,
  type: algosdk.ABIArgumentType,
  path: FieldPath<any>,
  hint?: ArgumentHint,
  options?: { prefix?: string; description?: string }
): JSX.Element | undefined => {
  if (
    type instanceof algosdk.ABIUintType ||
    type instanceof algosdk.ABIByteType ||
    type === algosdk.ABIReferenceType.asset ||
    type === algosdk.ABIReferenceType.application
  ) {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}` as Path<any>,
      placeholder: options?.description,
    })
  }
  if (type instanceof algosdk.ABIBoolType) {
    return formFieldHelper.selectField({
      label: 'Value',
      field: `${path}` as Path<any>,
      options: [
        {
          value: 'false',
          label: 'False',
        },
        {
          value: 'true',
          label: 'True',
        },
      ],
    })
  }
  if (type instanceof algosdk.ABIUfixedType) {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}` as Path<any>,
      placeholder: options?.description,
      decimalScale: type.precision,
      fixedDecimalScale: true,
    })
  }
  if (
    (type instanceof algosdk.ABIArrayStaticType && type.childType instanceof algosdk.ABIByteType) ||
    (type instanceof algosdk.ABIArrayDynamicType && type.childType instanceof algosdk.ABIByteType)
  ) {
    return formFieldHelper.textField({
      label: 'Value',
      field: `${path}` as Path<any>,
      placeholder: options?.description,
      helpText: 'A Base64 encoded Bytes value',
    })
  }
  if (type instanceof algosdk.ABIArrayStaticType) {
    const prefix = options?.prefix ?? 'Item'
    return formFieldHelper.abiStaticArrayField({
      field: `${path}` as Path<any>,
      prefix: prefix,
      length: type.staticLength,
      description: options?.description,
      createChildField: (childPrefix, childIndex) =>
        getCreateField(formFieldHelper, type.childType, `${path}${arrayItemPathSeparator}${childIndex}` as FieldPath<any>, undefined, {
          prefix: childPrefix,
        }),
    })
  }
  if (type instanceof algosdk.ABIAddressType) {
    return formFieldHelper.textField({
      label: 'Value',
      field: `${path}` as Path<any>,
      placeholder: options?.description,
    })
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    const prefix = options?.prefix ?? 'Item'
    return formFieldHelper.abiDynamicArrayField({
      field: `${path}` as Path<any>,
      description: options?.description,
      prefix: prefix,
      createChildField: (childPrefix, childIndex) =>
        getCreateField(
          formFieldHelper,
          type.childType,
          `${path}${arrayItemPathSeparator}${childIndex}${arrayItemPathSeparator}child` as FieldPath<any>,
          undefined,
          {
            prefix: childPrefix,
          }
        ),
    })
  }
  if (type instanceof algosdk.ABIStringType || type === algosdk.ABIReferenceType.account) {
    return formFieldHelper.textField({
      label: 'Value',
      field: `${path}` as Path<any>,
      placeholder: options?.description,
    })
  }
  if (type instanceof algosdk.ABITupleType) {
    const prefix = options?.prefix ?? 'Item'
    return formFieldHelper.abiTupleField({
      field: `${path}` as Path<any>,
      length: type.childTypes.length,
      prefix: prefix,
      description: options?.description,
      createChildField: (childPrefix, childIndex) =>
        getCreateField(
          formFieldHelper,
          type.childTypes[childIndex],
          `${path}${arrayItemPathSeparator}${childIndex}` as FieldPath<any>,
          undefined,
          {
            prefix: childPrefix,
          }
        ),
      struct: hint?.struct,
    })
  }
  return undefined
}

const getAppCallArg = async (type: algosdk.ABIArgumentType, value: unknown): Promise<MethodCallArg> => {
  if (type instanceof algosdk.ABIUfixedType) {
    return fixedPointDecimalStringToBigInt(value as string, type.precision) as algosdk.ABIValue
  }
  if (
    (type instanceof algosdk.ABIArrayStaticType && type.childType instanceof algosdk.ABIByteType) ||
    (type instanceof algosdk.ABIArrayDynamicType && type.childType instanceof algosdk.ABIByteType)
  ) {
    return base64ToBytes(value as string) as algosdk.ABIValue
  }

  if (type instanceof algosdk.ABIArrayStaticType) {
    return (await Promise.all((value as unknown[]).map((item) => getAppCallArg(type.childType, item)))) as algosdk.ABIValue
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    return (await Promise.all((value as any[]).map((item) => getAppCallArg(type.childType, item.child)))) as algosdk.ABIValue
  }
  if (type instanceof algosdk.ABITupleType) {
    return (await Promise.all((value as unknown[]).map((item, index) => getAppCallArg(type.childTypes[index], item)))) as algosdk.ABIValue
  }
  if (algosdk.abiTypeIsTransaction(type)) {
    if (value && typeof value === 'object' && 'type' in value) {
      return value as unknown as BuildTransactionResult
    }
  }
  return value as algosdk.ABIValue
}

const asField = (arg: ArgumentDefinition, argIndex: number): ArgumentField | TransactionArgumentField => {
  const isArgOptional = !!arg.hint?.defaultArgument
  if (!algosdk.abiTypeIsTransaction(arg.type)) {
    return {
      ...arg,
      path: argumentFieldPath(argIndex),
      createField: (helper: FormFieldHelper<any>) =>
        getCreateField(helper, arg.type, argumentFieldPath(argIndex) as FieldPath<any>, arg.hint, {
          description: arg.description,
        }),
      fieldSchema: getFieldSchema(arg.type, isArgOptional),
      getAppCallArg: (value) => getAppCallArg(arg.type, value),
    }
  } else {
    const transactionType = arg.type
    return {
      ...arg,
      transactionType: transactionType,
      path: argumentFieldPath(argIndex),
      createField: (helper: FormFieldHelper<any>, onEdit: () => void) =>
        helper.transactionField({
          label: 'Value',
          field: argumentFieldPath(argIndex) as FieldPath<any>,
          placeholder: arg.description,
          onEdit: onEdit,
          transactionType: transactionType,
        }),
      fieldSchema: getFieldSchema(arg.type, isArgOptional),
      getAppCallArg: (value) => getAppCallArg(arg.type, value),
    }
  }
}

const fixedPointDecimalStringToBigInt = (s: string, decimalScale: number): bigint => {
  const [int, frac] = s.split('.')
  const intBigInt = BigInt(int.padEnd(int.length + decimalScale, '0'))
  const fracBigInt = frac ? BigInt(frac.padEnd(decimalScale, '0')) : BigInt(0)
  return intBigInt + fracBigInt
}

export const asMethodForm = (method: MethodDefinition): MethodForm => {
  const argFields = method.arguments.map((arg, index) => {
    return asField(arg, index)
  })
  const methodSchema = argFields.reduce(
    (acc, arg, index) => {
      return {
        ...acc,
        [argumentFieldPath(index)]: arg.fieldSchema,
      }
    },
    {} as Record<string, z.ZodTypeAny>
  )

  return {
    name: method.name,
    abiMethod: method.abiMethod,
    signature: method.signature,
    description: method.description,
    arguments: argFields,
    schema: methodSchema,
    returns: method.returns,
  } satisfies MethodForm
}
