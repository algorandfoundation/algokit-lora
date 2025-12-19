import { isValidAddress } from '@algorandfoundation/algokit-utils'

export const isAddress = (maybeAddress: string) => isValidAddress(maybeAddress)
