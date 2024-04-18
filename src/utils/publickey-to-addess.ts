import algosdk from 'algosdk'
import { Buffer } from 'buffer'

export const publicKeyToAddress = (publicKey: string) => algosdk.encodeAddress(Buffer.from(publicKey, 'base64'))
