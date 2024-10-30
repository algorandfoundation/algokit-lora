import { Address } from '@/features/accounts/data/types'
import { AddressOrNfd } from '../models'

export const asAddressOrNfd = (address: Address): AddressOrNfd => {
  return {
    value: address,
    resolvedAddress: address,
  } satisfies AddressOrNfd
}

export const asOptionalAddressOrNfd = (addressOrNfdSchema: Partial<AddressOrNfd>) => {
  return addressOrNfdSchema.value && addressOrNfdSchema.resolvedAddress
    ? ({ value: addressOrNfdSchema.value, resolvedAddress: addressOrNfdSchema.resolvedAddress } satisfies AddressOrNfd)
    : undefined
}

export const asOptionalAddressOrNfdSchema = (address?: Address) => {
  return {
    value: address,
    resolvedAddress: address,
  }
}
