import { MultisigTransactionSignature, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { MultisigModel, PaymentTransactionModel, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'
import * as algokit from '@algorandfoundation/algokit-utils'

export const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  invariant(transaction['confirmed-round'], 'confirmed-round is not set')
  invariant(transaction['round-time'], 'round-time is not set')
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

  // TODO: Handle notes
  return {
    id: transaction.id,
    type: TransactionType.Payment,
    confirmedRound: transaction['confirmed-round'],
    roundTime: transaction['round-time'] * 1000,
    group: transaction['group'],
    fee: algokit.microAlgos(transaction.fee),
    sender: transaction.sender,
    receiver: transaction['payment-transaction']['receiver'],
    amount: algokit.microAlgos(transaction['payment-transaction']['amount']),
    closeAmount: transaction['payment-transaction']['close-amount']
      ? algokit.microAlgos(transaction['payment-transaction']['close-amount'])
      : undefined,
    multisig: transaction.signature?.multisig ? asMultisig(transaction.signature.multisig) : undefined,
  } satisfies PaymentTransactionModel
}

export const asMultisig = (signature: MultisigTransactionSignature): MultisigModel => {
  return {
    version: signature.version,
    threshold: signature.threshold,
    subsigners: signature.subsignature.map((subsignature) => publicKeyToAddress(subsignature['public-key'])),
  }
}
