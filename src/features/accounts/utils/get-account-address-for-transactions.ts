import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { invariant } from '@/utils/invariant'
import { Address } from '../data/types'
import { TransactionResult } from '@/features/transactions/data/types'

export const getAddressesForTransaction = (transaction: TransactionResult): Address[] => {
  const addresses = new Set<Address>()
  addresses.add(transaction.sender)
  if (transaction.txType === TransactionType.Payment) {
    invariant(transaction.paymentTransaction, 'payment-transaction is not set')

    addresses.add(transaction.paymentTransaction.receiver)
    if (transaction.paymentTransaction.closeRemainderTo) {
      addresses.add(transaction.paymentTransaction.closeRemainderTo)
    }
  } else if (transaction.txType === TransactionType.AssetTransfer) {
    invariant(transaction.assetTransferTransaction, 'asset-transfer-transaction is not set')

    addresses.add(transaction.assetTransferTransaction.receiver)
    if (transaction.assetTransferTransaction.closeTo) {
      addresses.add(transaction.assetTransferTransaction.closeTo)
    }
  } else if (transaction.txType === TransactionType.AssetFreeze) {
    invariant(transaction.assetFreezeTransaction, 'asset-freeze-transaction is not set')

    addresses.add(transaction.assetFreezeTransaction.address)
  } else if (transaction.txType === TransactionType.AssetConfig) {
    invariant(transaction.assetConfigTransaction, 'asset-config-transaction is not set')
    if (transaction.assetConfigTransaction.params?.manager) {
      addresses.add(transaction.assetConfigTransaction.params?.manager)
    }
    if (transaction.assetConfigTransaction.params?.reserve) {
      addresses.add(transaction.assetConfigTransaction.params?.reserve)
    }
    if (transaction.assetConfigTransaction.params?.freeze) {
      addresses.add(transaction.assetConfigTransaction.params?.freeze)
    }
    if (transaction.assetConfigTransaction.params?.clawback) {
      addresses.add(transaction.assetConfigTransaction.params?.clawback)
    }
  } else if (transaction.txType === TransactionType.ApplicationCall) {
    invariant(transaction.applicationTransaction, 'application-transaction is not set')

    const innerTransactions = transaction.innerTxns ?? []
    for (const innerTxn of innerTransactions) {
      const innerAddresses = getAddressesForTransaction(innerTxn)
      for (const address of innerAddresses) {
        addresses.add(address)
      }
    }
  }
  return Array.from(addresses)
}
