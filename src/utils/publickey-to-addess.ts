import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { Buffer } from 'buffer'

export const publicKeyToAddress = (publicKey: string) => algosdk.encodeAddress(Buffer.from(publicKey, 'base64'))
