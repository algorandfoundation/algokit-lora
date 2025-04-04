import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { InnerPaymentTransaction, PaymentTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { transactionAmountLabel } from './transactions-table-columns'
import { transactionReceiverLabel, transactionSenderLabel } from './labels'
import {addressFromString, decodeTransaction, encodeTransaction, Transaction} from '@joe-p/algo_models'

type Props = {
  transaction: PaymentTransaction | InnerPaymentTransaction
}

export const transactionCloseRemainderToLabel = 'Close Remainder To'
export const transactionCloseRemainderAmountLabel = 'Close Remainder Amount'

export function PaymentTransactionInfo({ transaction }: Props) {
  const txnModel: Transaction = {
    header: {
      sender: addressFromString(transaction.sender),
      transactionType: 'Payment',
      fee: transaction.fee.microAlgos,
      firstValid: transaction.confirmedRound,
      lastValid: transaction.confirmedRound,
    },
    payFields: {
      amount: transaction.amount.microAlgos,
      receiver: addressFromString(transaction.receiver)
    }
  }

  const wasmTxn = decodeTransaction(encodeTransaction(txnModel));
  console.log('Pay fields from WASM:', wasmTxn.payFields);

  const paymentTransactionItems = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={wasmTxn.header.sender.address} showCopyButton={true} />,
      },
      {
        dt: transactionReceiverLabel,
        dd: <AccountLink address={wasmTxn.payFields!.receiver.address} showCopyButton={true} />,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAlgo amount={wasmTxn.payFields!.amount.microAlgo()} />,
      },
      ...(wasmTxn.payFields!.closeRemainderTo
        ? [
            {
              dt: transactionCloseRemainderToLabel,
              dd: <AccountLink address={wasmTxn.payFields!.closeRemainderTo!.address} showCopyButton={true} />,
            },
            {
              dt: transactionCloseRemainderAmountLabel,
              dd: <DisplayAlgo amount={transaction.closeRemainder!.amount} />,
            },
          ]
        : []),
    ],
    [transaction.sender, transaction.receiver, transaction.amount, transaction.closeRemainder]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h2>Payment</h2>
      </div>
      <DescriptionList items={paymentTransactionItems} />
    </div>
  )
}
