import { cn } from '@/features/common/utils'
import { PaymentTransaction } from './payment-transaction'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { MultiSigModel, PaymentTransactionModel, SignatureType, TransactionType } from '../models'
import algosdk from 'algosdk'
import invariant from 'tiny-invariant'
import { MultiSig } from './multisig'

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
  } satisfies PaymentTransactionModel
}

const asMultiSig = (transaction: TransactionResult): MultiSigModel => {
  return {
    type: transaction.signature?.multisig,
    version: transaction.signature?.multisig?.version,
    threshold: transaction.signature?.multisig?.threshold,
    subsignatures: transaction.signature?.multisig?.subsignature,
  } satisfies MultiSigModel
}

export function Transaction({ transaction }: Props) {
  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>Transaction</h1>
      {transaction['tx-type'] === algosdk.TransactionType.pay && (
        <PaymentTransaction transaction={asPaymentTransaction(transaction)} rawTransaction={transaction} />
      )}
      {transaction.signature?.multisig && <MultiSig multiSig={transaction.signature} />}
    </div>
  )
}
