import { Address } from '@/features/accounts/data/types'
import { AddressOrNfd, TransactionSender } from '../models'
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

export const asOptionalAddressOrNfd = (transactionSender: Partial<TransactionSender>): TransactionSender => {
  const autoPopulated = !!transactionSender.autoPopulated

  let resolvedAddress: TransactionSender = { value: '', resolvedAddress: '', autoPopulated: false }

  if (autoPopulated) {
    Object.assign(autoPopulated, true)
  }

  if (transactionSender.value) {
    Object.assign(resolvedAddress.value, transactionSender.value)
    Object.assign(resolvedAddress.resolvedAddress, transactionSender.value)
  }
  return resolvedAddress
}

export const asOptionalAddressOrNfdSchema = (address?: Address) => {
  return {
    value: address,
    resolvedAddress: address,
    autoPopulated: false,
  }
}
