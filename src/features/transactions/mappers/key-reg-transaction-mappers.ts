import { KeyRegistrationTransactionResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { KeyRegTransaction, BaseKeyRegTransaction, InnerKeyRegTransaction, TransactionType, KeyRegTransactionSubType } from '../models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapSubType = (keyreg: KeyRegistrationTransactionResult) =>
  keyreg['vote-first-valid'] !== undefined && keyreg['vote-last-valid'] && keyreg['vote-key-dilution'] && keyreg['vote-participation-key']
    ? KeyRegTransactionSubType.Online
    : KeyRegTransactionSubType.Offline

const mapCommonKeyRegTransactionProperties = (transactionResult: TransactionResult): BaseKeyRegTransaction => {
  invariant(transactionResult['keyreg-transaction'], 'keyreg-transaction is not set')
  const keyReg = transactionResult['keyreg-transaction']

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.KeyReg,
    subType: mapSubType(keyReg),
    voteParticipationKey: keyReg['vote-participation-key'],
    nonParticipation: keyReg['non-participation'],
    selectionParticipationKey: keyReg['selection-participation-key'],
    stateProofKey: keyReg['state-proof-key'],
    voteKeyDilution: keyReg['vote-key-dilution'],
    voteFirstValid: keyReg['vote-first-valid'],
    voteLastValid: keyReg['vote-last-valid'],
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
