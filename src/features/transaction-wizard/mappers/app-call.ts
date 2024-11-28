/* eslint-disable @typescript-eslint/no-explicit-any */
import algosdk from 'algosdk'
import { z } from 'zod'
import { FieldPath } from 'react-hook-form'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { ArgumentField, MethodForm, TransactionArgumentField } from '@/features/transaction-wizard/models'
import { ArgumentDefinition, MethodDefinition, StructFieldDefinition } from '@/features/applications/models'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import {
  abiReferenceTypeToFormItem,
  abiReferenceTypeToFormFieldSchema,
  abiTypeToFormItem,
  abiTypeToFormFieldSchema,
  abiFormItemValueToABIValue,
} from '@/features/abi-methods/mappers'

const argumentPathSeparator = '-'
export const methodArgPrefix = 'methodArg'

const argumentFieldPath = (argumentIndex: number) => `${methodArgPrefix}${argumentPathSeparator}${argumentIndex}`

const getFieldSchema = (type: algosdk.ABIArgumentType, isOptional: boolean): z.ZodTypeAny => {
  if (algosdk.abiTypeIsReference(type)) {
    return abiReferenceTypeToFormFieldSchema(type)
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
  return abiTypeToFormFieldSchema(type, isOptional)
}

const getCreateField = (
  formFieldHelper: FormFieldHelper<any>,
  type: algosdk.ABIType | algosdk.ABIReferenceType,
  path: FieldPath<any>,
  structFields?: StructFieldDefinition[],
  options?: { prefix?: string; description?: string }
): React.JSX.Element | undefined => {
  if (algosdk.abiTypeIsReference(type)) {
    return abiReferenceTypeToFormItem(formFieldHelper, type, path)
  }
  return abiTypeToFormItem(formFieldHelper, type, path, structFields, options)
}

const asField = (arg: ArgumentDefinition, argIndex: number): ArgumentField | TransactionArgumentField => {
  const isArgOptional = !!arg.defaultArgument
  if (!algosdk.abiTypeIsTransaction(arg.type)) {
    return {
      ...arg,
      type: arg.type,
      path: argumentFieldPath(argIndex),
      createField: (helper: FormFieldHelper<any>) =>
        getCreateField(
          helper,
          arg.type as algosdk.ABIType | algosdk.ABIReferenceType,
          argumentFieldPath(argIndex) as FieldPath<any>,
          arg.struct?.fields,
          {
            description: arg.description,
          }
        ),
      fieldSchema: getFieldSchema(arg.type, isArgOptional),
      getAppCallArg: (value) => (value !== undefined ? abiFormItemValueToABIValue(arg.type, value) : undefined),
    }
  } else {
    return {
      ...arg,
      type: arg.type,
      path: argumentFieldPath(argIndex),
      createField: (helper: FormFieldHelper<any>) =>
        helper.transactionField({
          label: 'Value',
          field: argumentFieldPath(argIndex) as FieldPath<any>,
        }),
    }
  }
}

export const asMethodForm = (method: MethodDefinition): MethodForm => {
  const argFields = method.arguments.map((arg, index) => {
    return asField(arg, index)
  })
  const methodSchema = argFields.reduce(
    (acc, arg, index) => {
      if ('fieldSchema' in arg) {
        return {
          ...acc,
          [argumentFieldPath(index)]: arg.fieldSchema,
        }
      }
      return acc
    },
    {} as Record<string, z.ZodTypeAny>
  )

  return {
    name: method.name,
    abiMethod: method.abiMethod,
    signature: method.signature,
    callConfig: method.callConfig,
    description: method.description,
    arguments: argFields,
    schema: methodSchema,
    returns: method.returns,
  } satisfies MethodForm
}

export const asFieldInput = (
  type: algosdk.ABIArgumentType,
  value: algosdk.ABIValue
): algosdk.ABIValue | { id: string; child: algosdk.ABIValue }[] => {
  if (type instanceof algosdk.ABIUfixedType) {
    return value
  }
  if (type instanceof algosdk.ABIBoolType) {
    return value.toString().toLowerCase()
  }
  if (
    (type instanceof algosdk.ABIArrayStaticType && type.childType instanceof algosdk.ABIByteType) ||
    (type instanceof algosdk.ABIArrayDynamicType && type.childType instanceof algosdk.ABIByteType)
  ) {
    return uint8ArrayToBase64(value as Uint8Array)
  }

  if (type instanceof algosdk.ABIArrayStaticType) {
    return (value as algosdk.ABIValue[]).map((item) => asFieldInput(type.childType, item)) as algosdk.ABIValue
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    return (value as any[]).map((item) => ({
      id: new Date().getTime().toString(),
      child: asFieldInput(type.childType, item),
    })) as unknown as algosdk.ABIValue[] | { id: string; child: algosdk.ABIValue }[]
  }
  if (type instanceof algosdk.ABITupleType) {
    return (value as any[]).map((item, index) => asFieldInput(type.childTypes[index], item)) as unknown as {
      id: string
      child: algosdk.ABIValue
    }[]
  }
  return value as algosdk.ABIValue
}
