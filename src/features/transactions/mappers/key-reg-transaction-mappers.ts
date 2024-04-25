import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { KeyRegTransaction, BaseKeyRegTransaction, InnerKeyRegTransaction, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonKeyRegTransactionProperties = (transactionResult: TransactionResult): BaseKeyRegTransaction => {
  invariant(transactionResult['keyreg-transaction'], 'keyreg-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.KeyReg,
    voteParticipationKey: transactionResult['keyreg-transaction']['vote-participation-key'],
    nonParticipation: transactionResult['keyreg-transaction']['non-participation'],
    selectionParticipationKey: transactionResult['keyreg-transaction']['selection-participation-key'],
    voteKeyDilution: transactionResult['keyreg-transaction']['vote-key-dilution'],
    voteFirstValid: transactionResult['keyreg-transaction']['vote-first-valid'],
    voteLastValid: transactionResult['keyreg-transaction']['vote-last-valid'],
  }
}

export const asKeyRegTransaction = (transactionResult: TransactionResult): KeyRegTransaction => {
  return {
    id: transactionResult.id,
    ...mapCommonKeyRegTransactionProperties(transactionResult),
  }
}

export const asInnerKeyRegTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult
): InnerKeyRegTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonKeyRegTransactionProperties(transactionResult),
  }
}
