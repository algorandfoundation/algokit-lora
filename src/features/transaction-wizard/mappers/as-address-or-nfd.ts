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
export const asOptionalAddressOrNfd = (transactionSender?: Partial<TransactionSender>): TransactionSender => {
  if (!transactionSender) return { value: '', resolvedAddress: '', autoPopulated: false }

  if (transactionSender.autoPopulated) {
    return { value: '', resolvedAddress: '', autoPopulated: false }
  }

  if (transactionSender.value) {
    return asAddressOrNfd(transactionSender.value)
  }

  return { value: '', resolvedAddress: '', autoPopulated: false }
}

export const asOptionalAddressOrNfdSchema = (address?: Address) => {
  return {
    value: address,
    resolvedAddress: address,
    autoPopulated: false,
  }
}
