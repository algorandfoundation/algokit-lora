import { Address } from 'algosdk'

export const isAddress = (maybeAddress: string) => {
  try {
    Address.fromString(maybeAddress)
    return true
  } catch {
    return false
  }
}
