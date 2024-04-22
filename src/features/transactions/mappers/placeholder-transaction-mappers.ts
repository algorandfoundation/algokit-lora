import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { PaymentTransactionModel, TransactionType } from '../models'
import * as algokit from '@algorandfoundation/algokit-utils'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { transformSignature } from './transaction-common-properties-mappers'

// This creates a placeholder transaction for transactions that we don't support yet
// TODO: Remove this code, once we support all transaction types
export const asPlaceholderTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  return {
    id: transaction.id,
    type: TransactionType.Payment,
    confirmedRound: transaction['confirmed-round']!,
    roundTime: transaction['round-time']! * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: ZERO_ADDRESS,
    amount: algokit.microAlgos(3141592),
    signature: transformSignature(transaction.signature),
    note: transaction.note,
    json: '{ "placeholder": true }',
  }
}
