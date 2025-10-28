import { isValidAddress } from '@algorandfoundation/algokit-utils/algosdk_legacy'

export const isAddress = (maybeAddress: string) => isValidAddress(maybeAddress)
