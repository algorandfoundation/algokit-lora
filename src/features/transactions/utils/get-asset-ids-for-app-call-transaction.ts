import algosdk from 'algosdk'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { invariant } from '@/utils/invariant'

export const getAssetIdsForTransaction = (transaction: TransactionResult): number[] => {
  // TODO: as we add more transaction types, we should add more cases here
  if (transaction['tx-type'] === algosdk.TransactionType.axfer) {
    invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

    return [transaction['asset-transfer-transaction']['asset-id']]
  }
  if (transaction['tx-type'] === algosdk.TransactionType.appl) {
    invariant(transaction['application-transaction'], 'application-transaction is not set')

    const innerTransactions = transaction['inner-txns'] ?? []
    return innerTransactions.reduce(
      (acc, innerTxn) => {
        const innerResult = getAssetIdsForTransaction(innerTxn)
        return acc.concat(innerResult)
      },
      transaction['application-transaction']['foreign-assets'] ?? ([] as number[])
    )
  }

  return []
}
