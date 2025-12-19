import { encodeAddress } from '@algorandfoundation/algokit-utils'
import { base64ToBytes } from '@algorandfoundation/algokit-utils'

export const publicKeyToAddress = (publicKey: string) => encodeAddress(base64ToBytes(publicKey))
