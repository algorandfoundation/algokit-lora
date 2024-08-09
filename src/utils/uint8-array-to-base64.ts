import { Buffer } from 'buffer'

export const uint8ArrayToBase64 = (arr: Uint8Array) => {
  return Buffer.from(arr).toString('base64')
}
