import { KeyRegTransaction, BaseKeyRegTransaction, InnerKeyRegTransaction, TransactionType, KeyRegTransactionSubType } from '../models'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { TransactionResult } from '../data/types'
import type { TransactionKeyreg } from '@algorandfoundation/algokit-utils/indexer-client'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'

const mapSubType = (keyreg: TransactionKeyreg) =>
  keyreg.voteFirstValid !== undefined && keyreg.voteLastValid && keyreg.voteKeyDilution && keyreg.voteParticipationKey
    ? KeyRegTransactionSubType.Online
    : KeyRegTransactionSubType.Offline

const mapCommonKeyRegTransactionProperties = (transactionResult: TransactionResult): BaseKeyRegTransaction => {
  const keyReg = transactionResult.keyregTransaction

  if (!keyReg) {
    return {
      ...mapCommonTransactionProperties(transactionResult),
      type: TransactionType.KeyReg,
      subType: KeyRegTransactionSubType.Offline,
    }
  }

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.KeyReg,
    subType: mapSubType(keyReg),
    voteParticipationKey: keyReg.voteParticipationKey ? uint8ArrayToBase64(keyReg.voteParticipationKey) : undefined,
    nonParticipation: keyReg.nonParticipation,
    selectionParticipationKey: keyReg.selectionParticipationKey ? uint8ArrayToBase64(keyReg.selectionParticipationKey) : undefined,
    stateProofKey: keyReg.stateProofKey ? uint8ArrayToBase64(keyReg.stateProofKey) : undefined,
    voteKeyDilution: keyReg.voteKeyDilution,
    voteFirstValid: keyReg.voteFirstValid,
    voteLastValid: keyReg.voteLastValid,
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
