import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { InnerTransactionId, Logicsig, Multisig, SignatureType, Singlesig } from '../models'
import { invariant } from '@/utils/invariant'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import { TransactionResult, TransactionSignature } from '@/features/transactions/data/types'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { isDefined } from '@/utils/is-defined'
import { normaliseAlgoSdkData } from '@/utils/as-json'
import { asJson } from '@/utils/as-json'

export const mapCommonTransactionProperties = (transactionResult: TransactionResult) => {
  invariant(transactionResult.confirmedRound !== undefined, 'confirmed-round is not set')
  invariant(transactionResult.roundTime, 'round-time is not set')

  return {
    confirmedRound: transactionResult.confirmedRound,
    roundTime: transactionResult.roundTime * 1000,
    group: transactionResult.group ? uint8ArrayToBase64(transactionResult.group) : undefined,
    fee: microAlgos(transactionResult.fee),
    sender: transactionResult.sender,
    signature: transformSignature(transactionResult.signature),
    note: transactionResult.note ? uint8ArrayToBase64(transactionResult.note) : undefined,
    json: asJson(normaliseAlgoSdkData(transactionResult)),
    rekeyTo: transactionResult.rekeyTo?.toString(),
    signer: transactionResult.authAddr?.toString(),
  }
}

export const transformSignature = (signature?: TransactionSignature) => {
  if (signature?.sig) {
    return {
      type: SignatureType.Single,
      signer: uint8ArrayToBase64(signature.sig),
    } satisfies Singlesig
  }

  if (signature?.multisig) {
    return {
      type: SignatureType.Multi,
      version: signature.multisig.version,
      threshold: signature.multisig.threshold,
      subsigners: signature.multisig.subsignature
        ?.map((subsignature) => (subsignature.publicKey ? algosdk.encodeAddress(subsignature.publicKey) : undefined))
        .filter(isDefined),
    } satisfies Multisig
  }

  if (signature?.logicsig) {
    return {
      type: SignatureType.Logic,
      logic: uint8ArrayToBase64(signature.logicsig.logic),
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
