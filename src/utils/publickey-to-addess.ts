import { encodeAddress } from 'algosdk'
import { base64ToBytes } from './base64-to-bytes'

export const publicKeyToAddress = (publicKey: string) => encodeAddress(base64ToBytes(publicKey))
