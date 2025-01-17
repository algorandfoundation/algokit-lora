import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { HeartbeatTransaction, TransactionType } from '../models'
import { mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { invariant } from '@/utils/invariant'

export const asHeartbeatTransaction = (transactionResult: TransactionResult): HeartbeatTransaction => {
  invariant(transactionResult['heartbeat-transaction'], 'heartbeat-transaction is not set')
  const heartbeat = transactionResult['heartbeat-transaction']

  return {
    id: transactionResult.id,
    type: TransactionType.Heartbeat,
    subType: undefined,
    address: heartbeat['hb-address'],
    ...mapCommonTransactionProperties(transactionResult),
  }
}
