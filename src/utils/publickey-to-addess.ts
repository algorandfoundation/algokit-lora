import { encodeAddress } from '@algorandfoundation/algokit-utils'
import { base64ToBytes } from './base64-to-bytes'

export const publicKeyToAddress = (publicKey: string) => encodeAddress(base64ToBytes(publicKey))
