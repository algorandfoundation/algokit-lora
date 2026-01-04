import { Address } from '@algorandfoundation/algokit-utils'

export const isAddress = (maybeAddress: string) => {
  try {
    Address.fromString(maybeAddress)
    return true
  } catch {
    return false
  }
}
