import { Address } from 'algosdk'
import { uint8ArrayToBase64 } from './uint8-array-to-base64'

const toKebabCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter, index) => (index === 0 ? letter.toLowerCase() : '-' + letter.toLowerCase()))

export const normaliseAlgoSdkData = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(normaliseAlgoSdkData)
  }

  if (obj instanceof Uint8Array) {
    return uint8ArrayToBase64(obj)
  }

  if (obj instanceof Address) {
    return obj.toString()
  }

  if (obj != null && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [toKebabCase(key), normaliseAlgoSdkData(value)]))
  }

  return obj
}

export const asJson = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
