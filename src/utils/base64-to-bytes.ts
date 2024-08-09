import { Buffer } from 'buffer'

export const base64ToBytes = (arg: string) => {
  return Uint8Array.from(Buffer.from(arg, 'base64'))
}
