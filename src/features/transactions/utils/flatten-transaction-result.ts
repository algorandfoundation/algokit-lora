import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'

export const flattenTransactionResult = (transactionResult: TransactionResult): TransactionResult[] => {
  const results = [transactionResult]

  if (transactionResult['tx-type'] !== algosdk.TransactionType.appl) {
    return results
  }

  const innerTransactions = transactionResult['inner-txns'] ?? []

  return results.concat(innerTransactions.flatMap(flattenTransactionResult))
}
