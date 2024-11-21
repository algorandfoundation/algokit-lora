/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from '@/utils/read-file'
import {
  ABITypeTemplateParam,
  AppSpecStandard,
  AppSpecVersion,
  Arc32AppSpec,
  Arc4AppSpec,
  UnknownTypeTemplateParam,
  TemplateParamType,
  AVMTypeTemplateParam,
} from '../data/types'
import {
  abiTypeToFormItem,
  abiTypeToFormFieldSchema,
  formItemValueToABIValue,
  jsonAsArc32AppSpec,
  jsonAsArc4AppSpec,
  jsonAsArc56AppSpec,
  bigIntToFixedPointDecimalString,
  avmTypeToFormFieldSchema,
  avmTypeToFormItem,
} from '@/features/abi-methods/mappers'
import { Arc56Contract, AVMType } from '@algorandfoundation/algokit-utils/types/app-arc56'
import algosdk from 'algosdk'
import { StructDefinition } from '@/features/applications/models'
import {
  TealUnknownTypeTemplateParamFieldValue,
  TealTemplateParamField,
  TealAVMTypeTemplateParamFieldValue,
} from '@/features/app-interfaces/models'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { FieldPath } from 'react-hook-form'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { TemplateParamForm } from '../components/create/template-param-form'
import { Label } from '@/features/common/components/label'
import { isAVMType } from '@/features/app-interfaces/utils/is-avm-type'
import { FormItemValue } from '@/features/abi-methods/models'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { asAddressOrNfd } from '@/features/transaction-wizard/mappers/as-address-or-nfd'

export const parseAsAppSpec = async (
  file: File,
  supportedStandards: AppSpecStandard[]
): Promise<Arc32AppSpec | Arc4AppSpec | Arc56Contract> => {
  try {
    const content = await readFile(file)
    const jsonData = JSON.parse(content as string)

    if (supportedStandards.includes(AppSpecStandard.ARC32)) {
      try {
        return jsonAsArc32AppSpec(jsonData)
      } catch {
        // ignore
      }
    }
    if (supportedStandards.includes(AppSpecStandard.ARC56)) {
      try {
        return jsonAsArc56AppSpec(jsonData)
      } catch {
        // ignore
      }
    }
    if (supportedStandards.includes(AppSpecStandard.ARC4)) {
      try {
        return jsonAsArc4AppSpec(jsonData)
      } catch {
        // ignore
      }
    }

    throw new Error('Not supported')
  } catch {
    throw new Error(`The file is not a valid ${supportedStandards.join(' or ')} app spec`)
  }
}

export const asAppSpecFilename = (appSpecVersion: AppSpecVersion) => {
  return (
    appSpecVersion.standard === AppSpecStandard.ARC32
      ? `${appSpecVersion.appSpec.contract.name}.arc32.json`
      : appSpecVersion.standard === AppSpecStandard.ARC56
        ? `${appSpecVersion.appSpec.name}.arc56.json`
        : `${appSpecVersion.appSpec.name}.arc4.json`
  )
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()
}

export const getLatestAppSpecVersion = (appSpecVersions: AppSpecVersion[]): AppSpecVersion | undefined => {
  const noRoundLastValid = appSpecVersions.find((appSpec) => appSpec.roundLastValid === undefined)
  if (noRoundLastValid) {
    return noRoundLastValid
  }
  const sorted = appSpecVersions.sort((a, b) => b.roundLastValid! - a.roundLastValid!)

  if (sorted.length > 0) {
    return sorted[0]
  }

  return undefined
}

export const asTealTemplateParamFieldPath = (name: string) => `template-param-${name}`

export const asTealTemplateParamField = ({
  name,
  type,
  struct,
  defaultValue,
}: {
  name: string
  type?: algosdk.ABIType | AVMType
  struct?: StructDefinition
  defaultValue?: FormItemValue | TealAVMTypeTemplateParamFieldValue
}): TealTemplateParamField => {
  if (!type) {
    return {
      name: name,
      path: asTealTemplateParamFieldPath(name),
      fieldSchema: z.object({
        type: z.nativeEnum(TemplateParamType),
        value: zfd.text(),
      }),
      createField: (helper: FormFieldHelper<any>) => (
        <TemplateParamForm
          name={name}
          path={asTealTemplateParamFieldPath(name)}
          formHelper={helper}
          disabled={defaultValue !== undefined}
        />
      ),
      toTemplateParam: (values: TealUnknownTypeTemplateParamFieldValue) =>
        ({
          name: name,
          type: values.type,
          value: values.value,
        }) satisfies UnknownTypeTemplateParam,
      fromTemplateParam: (templateParam: UnknownTypeTemplateParam) =>
        ({
          type: templateParam.type,
          value: templateParam.value,
        }) satisfies TealUnknownTypeTemplateParamFieldValue,
    }
  }
  if (isAVMType(type)) {
    return {
      name: name,
      type: type,
      path: asTealTemplateParamFieldPath(name),
      fieldSchema: avmTypeToFormFieldSchema(type),
      createField: (helper: FormFieldHelper<any>) => {
        return (
          <>
            <Label>{name}</Label>
            {avmTypeToFormItem(helper, type, asTealTemplateParamFieldPath(name) as FieldPath<any>)}
          </>
        )
      },
      toTemplateParam: (value: TealAVMTypeTemplateParamFieldValue) =>
        ({
          name: name,
          value: value,
        }) satisfies AVMTypeTemplateParam,
      fromTemplateParam: (templateParam: AVMTypeTemplateParam) =>
        type === 'AVMUint64' ? BigInt(templateParam.value) : templateParam.value,
      defaultValue: defaultValue as TealAVMTypeTemplateParamFieldValue,
    }
  }

  return {
    name: name,
    path: asTealTemplateParamFieldPath(name),
    struct: struct,
    type: type,
    fieldSchema: abiTypeToFormFieldSchema(type, false),
    createField: (helper: FormFieldHelper<any>) => {
      return (
        <>
          <Label>{name}</Label>
          {abiTypeToFormItem(helper, type, asTealTemplateParamFieldPath(name) as FieldPath<any>, struct?.fields)}
        </>
      )
    },
    toTemplateParam: (value: FormItemValue): ABITypeTemplateParam => ({
      name: name,
      abiType: type,
      value: formItemValueToABIValue(type, value),
    }),
    fromTemplateParam: (templateParam: ABITypeTemplateParam): FormItemValue => asFormItemValue(templateParam.abiType, templateParam.value),
    defaultValue: defaultValue as FormItemValue,
  }
}

export const asTealAVMTypeTemplateParamFieldValue = (type: AVMType, base64Value: string): TealAVMTypeTemplateParamFieldValue => {
  if (type === 'AVMUint64') {
    return algosdk.ABIType.from('uint64').decode(base64ToBytes(base64Value)) as bigint
  }
  if (type === 'AVMString') {
    return base64ToUtf8(base64Value)
  }
  if (type === 'AVMBytes') {
    return base64Value
  }
  throw new Error(`Unknown type ${type}`)
}

export const asFormItemValue = (type: algosdk.ABIType, value: algosdk.ABIValue): FormItemValue => {
  if (type instanceof algosdk.ABITupleType) {
    const childTypes = type.childTypes
    return (value as algosdk.ABIValue[]).map((v, index) => asFormItemValue(childTypes[index], v))
  }
  if (type instanceof algosdk.ABIArrayStaticType || type instanceof algosdk.ABIArrayDynamicType) {
    const childType = type.childType
    if (childType instanceof algosdk.ABIByteType) {
      // Treat bytes arrays as strings
      return uint8ArrayToBase64(value as Uint8Array)
    } else {
      return (value as algosdk.ABIValue[]).map((v) => asFormItemValue(childType, v))
    }
  }
  if (type instanceof algosdk.ABIAddressType) {
    return asAddressOrNfd(value as string)
  }
  if (type instanceof algosdk.ABIAddressType || type instanceof algosdk.ABIStringType) {
    return value as string
  }
  if (type instanceof algosdk.ABIBoolType) {
    return value as boolean
  }
  if (type instanceof algosdk.ABIUintType) {
    return value as bigint
  }
  if (type instanceof algosdk.ABIUfixedType) {
    return bigIntToFixedPointDecimalString(value as bigint, type.precision)
  }
  if (type instanceof algosdk.ABIByteType) {
    return value as number
  }

  throw new Error(`Unknown type ${type}`)
}
