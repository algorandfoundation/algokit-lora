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

const toNumber = (value: number | bigint) => {
  if (typeof value === 'number') return value

  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`Cannot convert ${value} to a Number as it is larger than the maximum safe integer the Number type can hold.`)
  } else if (value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error(`Cannot convert ${value} to a Number as it is smaller than the minimum safe integer the Number type can hold.`)
  }
  return Number(value)
}

const defaultJsonValueReplacer = (_key: string, value: unknown) => {
  if (typeof value === 'bigint') {
    try {
      return toNumber(value)
    } catch {
      return value.toString()
    }
  }
  return value
}

export const asJson = (
  value: unknown,
  replacer: (key: string, value: unknown) => unknown = defaultJsonValueReplacer,
  space?: string | number
) => {
  return JSON.stringify(value, replacer, space)
}
