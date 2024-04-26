import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { StateProofTransaction, TransactionType } from '../models'
import { mapCommonTransactionProperties } from './transaction-common-properties-mappers'

export const asStateProofTransaction = (transactionResult: TransactionResult): StateProofTransaction => {
  return {
    id: transactionResult.id,
    type: TransactionType.StateProof,
    ...mapCommonTransactionProperties(transactionResult),
  }
}
