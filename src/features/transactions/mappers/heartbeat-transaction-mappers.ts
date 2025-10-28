import { TransactionResult } from '../data/types'
import { HeartbeatTransaction, TransactionType } from '../models'
import { mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { invariant } from '@/utils/invariant'

export const asHeartbeatTransaction = (transactionResult: TransactionResult): HeartbeatTransaction => {
  invariant(transactionResult.heartbeatTransaction, 'heartbeat-transaction is not set')
  const heartbeat = transactionResult.heartbeatTransaction

  return {
    id: transactionResult.id,
    type: TransactionType.Heartbeat,
    subType: undefined,
    address: heartbeat.hbAddress,
    ...mapCommonTransactionProperties(transactionResult),
  }
}
