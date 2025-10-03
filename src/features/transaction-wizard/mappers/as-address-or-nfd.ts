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

export const asTransactionSender = (transactionSender?: TransactionSender): TransactionSender => {
  const emptySender: TransactionSender = {
    value: undefined,
    resolvedAddress: undefined,
    autoPopulated: false,
  }
  if (!transactionSender) return emptySender
  if (transactionSender.autoPopulated) return emptySender

  return transactionSender.value && transactionSender.resolvedAddress
    ? { value: transactionSender.value, resolvedAddress: transactionSender.resolvedAddress, autoPopulated: transactionSender.autoPopulated }
    : emptySender
}

export const asOptionalAddressOrNfdSchema = (address?: Address) => {
  return {
    value: address,
    resolvedAddress: address,
    autoPopulated: false,
  }
}
