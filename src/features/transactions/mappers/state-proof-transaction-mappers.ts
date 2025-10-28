import { TransactionType } from '@algorandfoundation/algokit-utils/algokit_transact'
import { TransactionResult } from '@/features/transactions/data/types'
import { StateProofTransaction, TransactionType } from '../models'
import { mapCommonTransactionProperties } from './transaction-common-properties-mappers'

export const asStateProofTransaction = (transactionResult: TransactionResult): StateProofTransaction => {
  return {
    id: transactionResult.id,
    type: TransactionType.StateProof,
    subType: undefined,
    ...mapCommonTransactionProperties(transactionResult),
  }
}
