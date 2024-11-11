import algosdk from 'algosdk'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { AddressOrNfd } from '@/features/transaction-wizard/models'
import { fixedPointDecimalStringToBigInt } from '@/features/abi-methods/mappers/ufixed-mappers'
import { DynamicArrayFormItemValue, FormItemValue } from '../models'

export const formItemValueToABIValue = (type: algosdk.ABIArgumentType, value: FormItemValue): algosdk.ABIValue => {
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
    return (value as FormItemValue[]).map((item) => formItemValueToABIValue(type.childType, item))
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    return (value as DynamicArrayFormItemValue[]).map((item) => formItemValueToABIValue(type.childType, item.child))
  }
  if (type instanceof algosdk.ABITupleType) {
    return (value as FormItemValue[]).map((item, index) => formItemValueToABIValue(type.childTypes[index], item))
  }
  if (type instanceof algosdk.ABIAddressType || type === algosdk.ABIReferenceType.account) {
    return (value as AddressOrNfd).resolvedAddress
  }
  return value as algosdk.ABIValue
}
