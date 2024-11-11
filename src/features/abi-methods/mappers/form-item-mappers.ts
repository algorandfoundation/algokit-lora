/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import algosdk from 'algosdk'
import { FieldPath, Path } from 'react-hook-form'
import { StructFieldDefinition } from '@/features/applications/models'
import { AVMType } from '@algorandfoundation/algokit-utils/types/app-arc56'

const arrayItemPathSeparator = '.' // This must be a . for react hook form to work

export const abiTypeToFormItem = (
  formFieldHelper: FormFieldHelper<any>,
  type: algosdk.ABIType,
  path: FieldPath<any>,
  structFields?: StructFieldDefinition[],
  options?: { prefix?: string; description?: string }
): React.JSX.Element | undefined => {
  if (type instanceof algosdk.ABIUintType || type instanceof algosdk.ABIByteType) {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}` as Path<any>,
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
      helpText: 'A base64 encoded bytes value',
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
        abiTypeToFormItem(formFieldHelper, type.childType, `${path}${arrayItemPathSeparator}${childIndex}` as FieldPath<any>, undefined, {
          prefix: `${childPrefix} -`,
        }),
    })
  }
  if (type instanceof algosdk.ABIAddressType) {
    return formFieldHelper.addressField({
      label: 'Value',
      field: `${path}` as Path<any>,
    })
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    const prefix = options?.prefix ?? 'Item'
    return formFieldHelper.abiDynamicArrayField({
      field: `${path}` as Path<any>,
      description: options?.description,
      prefix: prefix,
      createChildField: (childPrefix, childIndex) =>
        abiTypeToFormItem(
          formFieldHelper,
          type.childType,
          `${path}${arrayItemPathSeparator}${childIndex}${arrayItemPathSeparator}child` as FieldPath<any>,
          undefined,
          {
            prefix: `${childPrefix} -`,
          }
        ),
    })
  }
  if (type instanceof algosdk.ABIStringType) {
    return formFieldHelper.textField({
      label: 'Value',
      field: `${path}` as Path<any>,
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
        abiTypeToFormItem(
          formFieldHelper,
          type.childTypes[childIndex],
          `${path}${arrayItemPathSeparator}${childIndex}` as FieldPath<any>,
          structFields && Array.isArray(structFields[childIndex].type) ? structFields[childIndex].type : undefined,
          {
            prefix: `${childPrefix} -`,
          }
        ),
      structFields: structFields,
    })
  }
  return undefined
}

export const abiReferenceTypeToFormItem = (formFieldHelper: FormFieldHelper<any>, type: algosdk.ABIReferenceType, path: FieldPath<any>) => {
  if (type === algosdk.ABIReferenceType.asset || type === algosdk.ABIReferenceType.application) {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}` as Path<any>,
    })
  }
  if (type === algosdk.ABIReferenceType.account) {
    return formFieldHelper.addressField({
      label: 'Value',
      field: `${path}` as Path<any>,
    })
  }

  return undefined
}

export const avmTypeToFormItem = (formFieldHelper: FormFieldHelper<any>, type: AVMType, path: FieldPath<any>) => {
  if (type === 'AVMUint64') {
    return formFieldHelper.numberField({
      label: 'Value',
      field: `${path}`,
    })
  }
  return formFieldHelper.textField({
    label: 'Value',
    field: `${path}`,
  })
}
