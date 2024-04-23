import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { PaymentTransactionModel, TransactionType } from '../models'
import * as algokit from '@algorandfoundation/algokit-utils'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { transformSignature } from './transaction-common-properties-mappers'

// This creates a placeholder transaction for transactions that we don't support yet
// TODO: Remove this code, once we support all transaction types
export const asPlaceholderTransaction = (transactionResult: TransactionResult): PaymentTransactionModel => {
  return {
    id: transactionResult.id,
    type: TransactionType.Payment,
    confirmedRound: transactionResult['confirmed-round']!,
    roundTime: transactionResult['round-time']! * 1000,
    group: transactionResult['group'],
    fee: algokit.microAlgos(transactionResult.fee),
    sender: transactionResult.sender,
    receiver: ZERO_ADDRESS,
    amount: algokit.microAlgos(3141592),
    signature: transformSignature(transactionResult.signature),
    note: transactionResult.note,
    json: '{ "placeholder": true }',
  }
}
