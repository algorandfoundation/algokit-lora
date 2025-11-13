import { Address } from '@/features/accounts/data/types'
import { AddressOrNfd } from '../models'
import { ActiveWalletAccount } from '@/features/wallet/types/active-wallet'

export const asAddressOrNfd = (addressOrAccount: Address | ActiveWalletAccount): AddressOrNfd => {
  if (typeof addressOrAccount === 'object') {
    return {
      value: addressOrAccount.nfd ? addressOrAccount.nfd : addressOrAccount.address,
      resolvedAddress: addressOrAccount.address,
    } satisfies AddressOrNfd
  }

  return {
    value: addressOrAccount,
    resolvedAddress: addressOrAccount,
  } satisfies AddressOrNfd
}

export const asOptionalAddressOrNfd = (addressOrNfdSchema?: Partial<AddressOrNfd>): AddressOrNfd | undefined => {
  if (!addressOrNfdSchema) return undefined
  if (!addressOrNfdSchema.value || !addressOrNfdSchema.resolvedAddress) return undefined
  return {
    value: addressOrNfdSchema.value,
    resolvedAddress: addressOrNfdSchema.resolvedAddress,
  } satisfies AddressOrNfd
}

export const asOptionalAddressOrNfdSchema = (address?: Address) => {
  return {
    value: address,
    resolvedAddress: address,
    autoPopulated: false,
  }
}
