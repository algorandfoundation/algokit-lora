import algosdk from 'algosdk'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { AddressOrNfd } from '@/features/transaction-wizard/models'
import { bigIntToFixedPointDecimalString, fixedPointDecimalStringToBigInt } from '@/features/abi-methods/mappers/ufixed-mappers'
import { DynamicArrayFormItemValue, AbiFormItemValue } from '../models'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { asAddressOrNfd } from '@/features/transaction-wizard/mappers/as-address-or-nfd'

export const abiFormItemValueToABIValue = (type: algosdk.ABIArgumentType, value: AbiFormItemValue): algosdk.ABIValue => {
  if (type instanceof algosdk.ABIUfixedType) {
    return fixedPointDecimalStringToBigInt(value as string, type.precision)
  }
  if (
    (type instanceof algosdk.ABIArrayStaticType && type.childType instanceof algosdk.ABIByteType) ||
    (type instanceof algosdk.ABIArrayDynamicType && type.childType instanceof algosdk.ABIByteType)
  ) {
    return base64ToBytes(value as string)
  }

  if (type instanceof algosdk.ABIArrayStaticType) {
    return (value as AbiFormItemValue[]).map((item) => abiFormItemValueToABIValue(type.childType, item))
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    return (value as DynamicArrayFormItemValue[]).map((item) => abiFormItemValueToABIValue(type.childType, item.child))
  }
  if (type instanceof algosdk.ABITupleType) {
    return (value as AbiFormItemValue[]).map((item, index) => abiFormItemValueToABIValue(type.childTypes[index], item))
  }
  if (type instanceof algosdk.ABIAddressType || type === algosdk.ABIReferenceType.account) {
    return (value as AddressOrNfd).resolvedAddress
  }
  return value as algosdk.ABIValue
}

export const asAbiFormItemValue = (type: algosdk.ABIType, value: algosdk.ABIValue): AbiFormItemValue => {
  if (type instanceof algosdk.ABITupleType) {
    const childTypes = type.childTypes
    return (value as algosdk.ABIValue[]).map((v, index) => asAbiFormItemValue(childTypes[index], v))
  }
  if (type instanceof algosdk.ABIArrayStaticType || type instanceof algosdk.ABIArrayDynamicType) {
    const childType = type.childType
    if (childType instanceof algosdk.ABIByteType) {
      // Treat bytes arrays as strings
      return base64ToUtf8(uint8ArrayToBase64(value as Uint8Array))
    } else {
      return (value as algosdk.ABIValue[]).map((v) => asAbiFormItemValue(childType, v))
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
