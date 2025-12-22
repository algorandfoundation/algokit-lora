import { SubscribedTransaction } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { TransactionResult } from '../data/types'

export const subscribedTransactionToTransactionResult = (subscribedTransaction: SubscribedTransaction): TransactionResult => {
  const {
    filtersMatched: _filtersMatched,
    balanceChanges: _balanceChanges,
    arc28Events: _arc28Events,
    ...transaction
  } = subscribedTransaction
  const innerTransactions = transaction.innerTxns?.map((innerTransaction, index) =>
    subscribedTransactionToInnerTransactionResult(innerTransaction, transaction.id, index + 1)
  )

  return {
    ...transaction,
    innerTxns: innerTransactions,
  }
}

const subscribedTransactionToInnerTransactionResult = (
  subscribedTransaction: SubscribedTransaction,
  parentTransactionId: string,
  offset: number
): TransactionResult => {
  const {
    filtersMatched: _filtersMatched,
    balanceChanges: _balanceChanges,
    arc28Events: _arc28Events,
    id: _id,
    parentTransactionId: _parentTransactionId,
    ...transaction
  } = subscribedTransaction

  const transactionId = parentTransactionId.includes('inner')
    ? `${parentTransactionId}/${offset}`
    : `${parentTransactionId}/inner/${offset}`

  const innerTransactions = transaction.innerTxns?.map((innerTransaction, index) =>
    subscribedTransactionToInnerTransactionResult(innerTransaction, transactionId, index + 1)
  )

  return {
    ...transaction,
    id: transactionId,
    intraRoundOffset: subscribedTransaction.parentIntraRoundOffset,
    innerTxns: innerTransactions,
  }
}
