import { isValidAddress } from 'algosdk'

export const isAddress = (maybeAddress: string) => isValidAddress(maybeAddress)
