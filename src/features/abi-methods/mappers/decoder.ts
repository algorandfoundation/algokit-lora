import { StructDefinition, StructFieldDefinition } from '@/features/applications/models'
import { sum } from '@/utils/sum'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import algosdk from 'algosdk'
import { DecodedAbiStruct, DecodedAbiStructField, DecodedAbiType, DecodedAbiValue } from '../models'
import { bigIntToFixedPointDecimalString } from './ufixed-mappers'

export const MAX_LINE_LENGTH = 20

export const asDecodedAbiStruct = (struct: StructDefinition, abiValue: algosdk.ABIValue): DecodedAbiStruct => {
  const decodeStructField = (field: StructFieldDefinition, abiValue: algosdk.ABIValue): DecodedAbiStructField => {
    if (Array.isArray(field.type)) {
      const valueAsArray = abiValue as algosdk.ABIValue[]
      const childrenFields = field.type.map((childField, index) => {
        return decodeStructField(childField, valueAsArray[index])
      })
      return {
        name: field.name,
        value: childrenFields,
        length: sum(childrenFields.map((v) => `${v.name}: ${v.value}`.length)),
        multiline: childrenFields.some((v) => v.multiline),
      }
    } else {
      const decodedValue = asDecodedAbiValue(field.type, abiValue)
      return {
        name: field.name,
        value: decodedValue,
        length: `${field.name.length}: ${decodedValue.length}`.length,
        multiline: decodedValue.multiline,
      }
    }
  }

  const abiValues = abiValue as algosdk.ABIValue[]
  const fields = struct.fields.map((structField, index) => {
    return decodeStructField(structField, abiValues[index])
  })
  const length = sum(fields.map((v) => `${v.name}: ${v.value}`.length))
  const multiline = fields.some((v) => v.multiline) || length > MAX_LINE_LENGTH

  return {
    type: DecodedAbiType.Struct,
    fields: fields,
    multiline: multiline,
    length: length,
  }
}

export const asDecodedAbiValue = (abiType: algosdk.ABIType, abiValue: algosdk.ABIValue): DecodedAbiValue => {
  if (abiType instanceof algosdk.ABITupleType) {
    const childTypes = abiType.childTypes
    const abiValues = abiValue as algosdk.ABIValue[]
    if (childTypes.length !== abiValues.length) {
      throw new Error('Tuple type has different number of child types than abi values')
    }
    const childrenValues = abiValues.map((abiValue, index) => asDecodedAbiValue(childTypes[index], abiValue))
    const length = sum(childrenValues.map((v) => v.length))
    const multiline = childrenValues.some((v) => v.multiline) || length > MAX_LINE_LENGTH

    return {
      type: DecodedAbiType.Tuple,
      values: childrenValues,
      multiline,
      length,
    }
  }
  if (abiType instanceof algosdk.ABIArrayStaticType || abiType instanceof algosdk.ABIArrayDynamicType) {
    const childType = abiType.childType
    if (childType instanceof algosdk.ABIByteType) {
      // Treat bytes arrays as strings
      const base64Value = uint8ArrayToBase64(abiValue as Uint8Array)
      return {
        type: DecodedAbiType.String,
        value: base64Value,
        multiline: false,
        length: base64Value.length,
      }
    } else {
      const abiValues = abiValue as algosdk.ABIValue[]
      const childrenValues = abiValues.map((abiValue) => asDecodedAbiValue(childType, abiValue))
      const length = sum(childrenValues.map((v) => v.length))
      const multiline = childrenValues.some((v) => v.multiline) || length > MAX_LINE_LENGTH

      return {
        type: DecodedAbiType.Array,
        values: childrenValues,
        multiline,
        length,
      }
    }
  }
  if (abiType instanceof algosdk.ABIStringType) {
    const stringValue = abiValue as string
    return {
      type: DecodedAbiType.String,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIAddressType) {
    const stringValue = abiValue as string
    return {
      type: DecodedAbiType.Address,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIBoolType) {
    const boolValue = abiValue as boolean
    return {
      type: DecodedAbiType.Boolean,
      value: boolValue,
      length: boolValue.toString().length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIUintType) {
    const bigintValue = abiValue as bigint
    return {
      type: DecodedAbiType.Uint,
      value: bigintValue,
      length: bigintValue.toString().length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIUfixedType) {
    const stringValue = bigIntToFixedPointDecimalString(abiValue as bigint, abiType.precision)
    return {
      type: DecodedAbiType.Ufixed,
      value: stringValue,
      length: stringValue.length,
      multiline: false,
    }
  }
  if (abiType instanceof algosdk.ABIByteType) {
    const numberValue = abiValue as number
    return {
      type: DecodedAbiType.Byte,
      value: numberValue,
      length: numberValue.toString().length,
      multiline: false,
    }
  }

  throw new Error(`Unknown type ${abiType}`)
}
