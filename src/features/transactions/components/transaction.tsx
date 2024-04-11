import { PaymentTransaction } from './payment-transaction'
import { TransactionResult, TransactionSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import { LogicsigModel, MultisigModel, PaymentTransactionModel, SignatureType, SinglesigModel, TransactionType } from '../models'
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
    signature: transformSignature(transaction.signature),
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

export function Transaction({ transaction }: Props) {
  if (transaction['tx-type'] === algosdk.TransactionType.pay) {
    return <PaymentTransaction transaction={asPaymentTransaction(transaction)} rawTransaction={transaction} />
  }

  return <></>
}
