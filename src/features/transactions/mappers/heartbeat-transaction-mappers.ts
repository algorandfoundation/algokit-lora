import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { HeartbeatTransaction, InnerHeartbeatTransaction, TransactionType } from '../models'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

export const asHeartbeatTransaction = (transactionResult: TransactionResult): HeartbeatTransaction => {
  return {
    id: transactionResult.id,
    type: TransactionType.Heartbeat,
    subType: undefined,
    ...mapCommonTransactionProperties(transactionResult),
  }
}

export const asInnerHeartbeatTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult
): InnerHeartbeatTransaction => {
  const { id: _id, ...rest } = asHeartbeatTransaction(transactionResult)
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...rest,
  }
}
