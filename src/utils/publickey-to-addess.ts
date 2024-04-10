import algosdk from 'algosdk'

export const publicKeyToAddress = (publicKey: string) => algosdk.encodeAddress(Buffer.from(publicKey, 'base64'))
