import { AVMType } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { base64ToUtf8, base64ToUtf8IfValid } from '@/utils/base64-to-utf8'
import { AvmValue, DecodedAvmType, DecodedAvmValue } from '../models'
import algosdk from 'algosdk'
import { base64ToBytes } from '@/utils/base64-to-bytes'

export const asAvmValue = (type: AVMType, base64Value: string): AvmValue => {
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

export const asDecodedAvmValue = (type: AVMType, base64Value: string): DecodedAvmValue => {
  if (type === 'AVMUint64') {
    return {
      type: DecodedAvmType.Uint,
      value: algosdk.ABIType.from('uint64').decode(base64ToBytes(base64Value)) as bigint,
    }
  }
  if (type === 'AVMString') {
    return {
      type: DecodedAvmType.String,
      value: base64ToUtf8(base64Value),
    }
  }
  if (type === 'AVMBytes') {
    const decoded = base64ToUtf8IfValid(base64Value)
    if (decoded === base64Value) {
      return {
        type: DecodedAvmType.Bytes,
        value: base64Value,
      }
    } else {
      return {
        type: DecodedAvmType.String,
        value: decoded,
      }
    }
  }
  throw new Error(`Unknown type ${type}`)
}
