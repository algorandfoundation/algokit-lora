import { TransactionResult, TransactionSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import { InnerTransactionId, Logicsig, Multisig, SignatureType, Singlesig } from '../models'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import { asJson } from '@/utils/as-json'

export const mapCommonTransactionProperties = (transactionResult: TransactionResult) => {
  invariant(transactionResult['confirmed-round'] !== undefined, 'confirmed-round is not set')
  invariant(transactionResult['round-time'], 'round-time is not set')

  return {
    confirmedRound: transactionResult['confirmed-round'],
    roundTime: transactionResult['round-time'] * 1000,
    group: transactionResult['group'],
    fee: microAlgos(transactionResult.fee),
    sender: transactionResult.sender,
    signature: transformSignature(transactionResult.signature),
    note: transactionResult.note,
    json: asJson(transactionResult),
    rekeyTo: transactionResult['rekey-to'],
  }
}

export const transformSignature = (signature?: TransactionSignature) => {
  if (signature?.sig) {
    return {
      type: SignatureType.Single,
      signer: signature.sig,
    } satisfies Singlesig
  }

  if (signature?.multisig) {
    return {
      type: SignatureType.Multi,
      version: signature.multisig.version,
      threshold: signature.multisig.threshold,
      subsigners: signature.multisig.subsignature.map((subsignature) => publicKeyToAddress(subsignature['public-key'])),
    } satisfies Multisig
  }

  if (signature?.logicsig) {
    return {
      type: SignatureType.Logic,
      logic: signature.logicsig.logic,
    } satisfies Logicsig
  }
}

export const asInnerTransactionId = (networkTransactionId: string, index: string): InnerTransactionId => {
  return {
    networkTransactionId: networkTransactionId,
    id: `${networkTransactionId}/inner/${index}`,
    innerId: index,
  }
}
