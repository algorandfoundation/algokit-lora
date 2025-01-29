import algosdk from 'algosdk'
import { TransactionResult } from '../data/types'

export const flattenTransactionResult = (transactionResult: TransactionResult): TransactionResult[] => {
  const results = [transactionResult]

  if (transactionResult.txType !== algosdk.TransactionType.appl) {
    return results
  }

  const innerTransactions = transactionResult.innerTxns ?? []

  return results.concat(innerTransactions.flatMap(flattenTransactionResult))
}
