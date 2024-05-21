import algosdk from 'algosdk'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { invariant } from '@/utils/invariant'
import { Address } from '../data/types'

export const getAddressesForTransaction = (transaction: TransactionResult): Address[] => {
  const addresses = new Set<Address>()
  addresses.add(transaction.sender)
  if (transaction['tx-type'] === algosdk.TransactionType.pay) {
    invariant(transaction['payment-transaction'], 'payment-transaction is not set')

    addresses.add(transaction['payment-transaction']['receiver'])
    if (transaction['payment-transaction']['close-remainder-to']) {
      addresses.add(transaction['payment-transaction']['close-remainder-to'])
    }
  } else if (transaction['tx-type'] === algosdk.TransactionType.axfer) {
    invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

    addresses.add(transaction['asset-transfer-transaction']['receiver'])
    if (transaction['asset-transfer-transaction']['close-to']) {
      addresses.add(transaction['asset-transfer-transaction']['close-to'])
    }
  } else if (transaction['tx-type'] === algosdk.TransactionType.afrz) {
    invariant(transaction['asset-freeze-transaction'], 'asset-freeze-transaction is not set')

    addresses.add(transaction['asset-freeze-transaction']['address'])
  } else if (transaction['tx-type'] === algosdk.TransactionType.acfg) {
    invariant(transaction['asset-config-transaction'], 'asset-config-transaction is not set')
    if (transaction['asset-config-transaction'].params?.manager) {
      addresses.add(transaction['asset-config-transaction'].params?.manager)
    }
    if (transaction['asset-config-transaction'].params?.reserve) {
      addresses.add(transaction['asset-config-transaction'].params?.reserve)
    }
    if (transaction['asset-config-transaction'].params?.freeze) {
      addresses.add(transaction['asset-config-transaction'].params?.freeze)
    }
    if (transaction['asset-config-transaction'].params?.clawback) {
      addresses.add(transaction['asset-config-transaction'].params?.clawback)
    }
  } else if (transaction['tx-type'] === algosdk.TransactionType.appl) {
    invariant(transaction['application-transaction'], 'application-transaction is not set')

    const innerTransactions = transaction['inner-txns'] ?? []
    for (const innerTxn of innerTransactions) {
      const innerAddresses = getAddressesForTransaction(innerTxn)
      for (const address of innerAddresses) {
        addresses.add(address)
      }
    }
  }
  return Array.from(addresses)
}
