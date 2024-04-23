import { TransactionResult, TransactionSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import { InnerTransactionId, LogicsigModel, MultisigModel, SignatureType, SinglesigModel } from '../models'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'
import * as algokit from '@algorandfoundation/algokit-utils'

export const mapCommonTransactionProperties = (transaction: TransactionResult) => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')

  return {
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    signature: transformSignature(transaction.signature),
    note: transaction.note,
    json: asJson(transaction),
  }
}

export const transformSignature = (signature?: TransactionSignature) => {
  if (signature?.sig) {
    return {
      type: SignatureType.Single,
      signer: signature.sig,
    } satisfies SinglesigModel
  }

  if (signature?.multisig) {
    return {
      type: SignatureType.Multi,
      version: signature.multisig.version,
      threshold: signature.multisig.threshold,
      subsigners: signature.multisig.subsignature.map((subsignature) => publicKeyToAddress(subsignature['public-key'])),
    } satisfies MultisigModel
  }

  if (signature?.logicsig) {
    return {
      type: SignatureType.Logic,
      logic: signature.logicsig.logic,
    } satisfies LogicsigModel
  }
}

const asJson = (transaction: TransactionResult) => JSON.stringify(transaction, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)

export const asInnerTransactionId = (networkTransactionId: string, index: string): InnerTransactionId => {
  return {
    id: `${networkTransactionId}-${index}`,
    innerId: index,
  }
}
