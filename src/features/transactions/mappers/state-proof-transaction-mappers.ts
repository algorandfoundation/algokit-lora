import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { InnerStateProofTransaction, StateProofTransaction, TransactionType } from '../models'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

export const asStateProofTransaction = (transactionResult: TransactionResult): StateProofTransaction => {
  return {
    id: transactionResult.id,
    type: TransactionType.StateProof,
    subType: undefined,
    ...mapCommonTransactionProperties(transactionResult),
  }
}

export const asInnerStateProofTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult
): InnerStateProofTransaction => {
  const { id: _id, ...rest } = asStateProofTransaction(transactionResult)
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...rest,
  }
}
