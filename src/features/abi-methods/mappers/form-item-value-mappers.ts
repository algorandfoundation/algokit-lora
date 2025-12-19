import {
  ABIAddressType,
  ABIArrayDynamicType,
  ABIArrayStaticType,
  ABIBoolType,
  ABIByteType,
  ABIReferenceType,
  ABIStringType,
  ABITupleType,
  ABIType,
  ABIUfixedType,
  ABIUintType,
  AVMType,
  ABIValue,
} from '@algorandfoundation/algokit-utils/abi'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { AddressOrNfd } from '@/features/transaction-wizard/models'
import { bigIntToFixedPointDecimalString, fixedPointDecimalStringToBigInt } from '@/features/abi-methods/mappers/ufixed-mappers'
import { DynamicArrayFormItemValue, AbiFormItemValue, AvmValue, AvmFormItemValue } from '../models'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { asAddressOrNfd } from '@/features/transaction-wizard/mappers/as-address-or-nfd'

type ABIArgumentType = ABIType | ABIReferenceType

export const abiFormItemValueToABIValue = (type: ABIArgumentType, value: AbiFormItemValue): ABIValue => {
  if (type instanceof ABIUfixedType) {
    return fixedPointDecimalStringToBigInt(value as string, type.precision)
  }
  if (
    (type instanceof ABIArrayStaticType && type.childType instanceof ABIByteType) ||
    (type instanceof ABIArrayDynamicType && type.childType instanceof ABIByteType)
  ) {
    return base64ToBytes(value as string)
  }

  if (type instanceof ABIArrayStaticType) {
    return (value as AbiFormItemValue[]).map((item) => abiFormItemValueToABIValue(type.childType, item))
  }
  if (type instanceof ABIArrayDynamicType) {
    return (value as DynamicArrayFormItemValue[]).map((item) => abiFormItemValueToABIValue(type.childType, item.child))
  }
  if (type instanceof ABITupleType) {
    return (value as AbiFormItemValue[]).map((item, index) => abiFormItemValueToABIValue(type.childTypes[index], item))
  }
  if (type instanceof ABIAddressType || type === ABIReferenceType.Account) {
    return (value as AddressOrNfd).resolvedAddress
  }
  return value as ABIValue
}

export const asAbiFormItemValue = (type: ABIType, value: ABIValue): AbiFormItemValue => {
  if (type instanceof ABITupleType) {
    const childTypes = type.childTypes
    return (value as ABIValue[]).map((v, index) => asAbiFormItemValue(childTypes[index], v))
  }
  if (type instanceof ABIArrayStaticType || type instanceof ABIArrayDynamicType) {
    const childType = type.childType
    if (childType instanceof ABIByteType) {
      // Treat bytes arrays as strings
      return base64ToUtf8(uint8ArrayToBase64(value as Uint8Array))
    } else {
      return (value as ABIValue[]).map((v) => asAbiFormItemValue(childType, v))
    }
  }
  if (type instanceof ABIAddressType) {
    return asAddressOrNfd(value as string)
  }
  if (type instanceof ABIAddressType || type instanceof ABIStringType) {
    return value as string
  }
  if (type instanceof ABIBoolType) {
    return value as boolean
  }
  if (type instanceof ABIUintType) {
    return value as bigint
  }
  if (type instanceof ABIUfixedType) {
    return bigIntToFixedPointDecimalString(value as bigint, type.precision)
  }
  if (type instanceof ABIByteType) {
    return value as number
  }

  throw new Error(`Unknown type ${type}`)
}

export const avmFormItemValueToAVMValue = (type: AVMType, value: AvmFormItemValue): AvmValue => {
  if (type === 'AVMBytes') {
    return base64ToBytes(value as string)
  }
  return value
}

export const asAvmFormItemValue = (type: AVMType, value: AvmValue): AvmFormItemValue => {
  if (type === 'AVMBytes') {
    return uint8ArrayToBase64(value as Uint8Array)
  }
  return value as AvmFormItemValue
}
