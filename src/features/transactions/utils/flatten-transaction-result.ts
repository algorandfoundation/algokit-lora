import { TransactionType } from '@algorandfoundation/algokit-utils/algokit_transact'
import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { TransactionResult } from '../data/types'

export const flattenTransactionResult = (transactionResult: TransactionResult): TransactionResult[] => {
  const results = [transactionResult]

  if (transactionResult.txType !== TransactionType.AppCall) {
    return results
  }

  const innerTransactions = transactionResult.innerTxns ?? []

  return results.concat(innerTransactions.flatMap(flattenTransactionResult))
}
