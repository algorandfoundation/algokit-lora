import { PaymentTransaction } from './payment-transaction'
import { MultisigTransactionSignature, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { MultisigModel, PaymentTransactionModel, TransactionType } from '../models'
import algosdk from 'algosdk'
import { invariant } from '@/utils/invariant'
import { publicKeyToAddress } from '@/utils/publickey-to-addess'

type Props = {
  transaction: TransactionResult
}

const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
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
    fee: transaction.fee.microAlgos(),
    sender: transaction.sender,
    receiver: transaction['payment-transaction']['receiver'],
    amount: transaction['payment-transaction']['amount'].microAlgos(),
    closeAmount: transaction['payment-transaction']['close-amount']?.microAlgos(),
    multisig: transaction.signature?.multisig ? asMultisig(transaction.signature.multisig) : undefined,
  } satisfies PaymentTransactionModel
}

const asMultisig = (signature: MultisigTransactionSignature): MultisigModel => {
  return {
    version: signature.version,
    threshold: signature.threshold,
    subsigners: signature.subsignature.map((subsignature) => publicKeyToAddress(subsignature['public-key'])),
  }
}

export function Transaction({ transaction }: Props) {
  if (transaction['tx-type'] === algosdk.TransactionType.pay) {
    return <PaymentTransaction transaction={asPaymentTransaction(transaction)} rawTransaction={transaction} />
  }

  return <></>
}
