import { isValidAddress } from '@algorandfoundation/algokit-utils/common'

export const isAddress = (maybeAddress: string) => isValidAddress(maybeAddress)
