import { TransactionResult, TransactionSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import { LogicsigModel, MultisigModel, PaymentTransactionModel, SignatureType, SinglesigModel, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'
import * as algokit from '@algorandfoundation/algokit-utils'

export const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

  return {
    id: transaction.id,
    type: TransactionType.Payment,
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: transaction['payment-transaction']['receiver'],
    // TODO: NC - Remove isNaN check once this fix is merged and released. https://github.com/algorandfoundation/algokit-subscriber-ts/pull/49
    amount: algokit.microAlgos(!isNaN(transaction['payment-transaction']['amount']) ? transaction['payment-transaction']['amount'] : 0),
    closeRemainder: transaction['payment-transaction']['close-remainder-to']
      ? {
          to: transaction['payment-transaction']['close-remainder-to'],
          amount: algokit.microAlgos(transaction['payment-transaction']['close-amount'] ?? 0),
        }
      : undefined,
    signature: transformSignature(transaction.signature),
    note: transaction.note,
  } satisfies PaymentTransactionModel
}

const transformSignature = (signature?: TransactionSignature) => {
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
