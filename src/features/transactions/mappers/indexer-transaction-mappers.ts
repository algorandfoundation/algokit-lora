import { removeEncodableMethods } from '@/utils/remove-encodable-methods'
import { TransactionId, TransactionResult } from '../data/types'
import algosdk from 'algosdk'

export const indexerTransactionToTransactionResult = (transaction: algosdk.indexerModels.Transaction): TransactionResult => {
  const { innerTxns, ...rest } = removeEncodableMethods(transaction)

  const innerTxnsWithId = innerTxns?.map((innerTxn, index) =>
    indexerTransactionToInnerTransactionResult(innerTxn, transaction.id!, index + 1)
  )

  return {
    ...rest,
    innerTxns: innerTxnsWithId,
    id: transaction.id!,
  }
}

export const indexerTransactionToInnerTransactionResult = (
  transaction: algosdk.indexerModels.Transaction,
  parentTransactionId: TransactionId,
  offset: number
): TransactionResult => {
  const transactionId = parentTransactionId.includes('inner')
    ? `${parentTransactionId}/${offset}`
    : `${parentTransactionId}/inner/${offset}`

  const innerTxns = transaction.innerTxns?.map((innerTxn, index) =>
    indexerTransactionToInnerTransactionResult(innerTxn, transactionId, index + 1)
  )

  return {
    ...removeEncodableMethods(transaction),
    id: transactionId,
    innerTxns,
  }
}
