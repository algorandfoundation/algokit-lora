import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { InnerPaymentTransaction, PaymentTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { transactionAmountLabel } from './transactions-table-columns'
import { transactionReceiverLabel, transactionSenderLabel } from './transaction-details'

type Props = {
  transaction: PaymentTransaction | InnerPaymentTransaction
}

export const transactionCloseRemainderToLabel = 'Close Remainder To'
export const transactionCloseRemainderAmountLabel = 'Close Remainder Amount'

export function PaymentTransactionInfo({ transaction }: Props) {
  const paymentTransactionItems = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender}></AccountLink>,
      },
      {
        dt: transactionReceiverLabel,
        dd: <AccountLink address={transaction.receiver}></AccountLink>,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAlgo amount={transaction.amount} />,
      },
      ...(transaction.closeRemainder
        ? [
            {
              dt: transactionCloseRemainderToLabel,
              dd: <AccountLink address={transaction.closeRemainder.to}></AccountLink>,
            },
            {
              dt: transactionCloseRemainderAmountLabel,
              dd: <DisplayAlgo amount={transaction.closeRemainder.amount} />,
            },
          ]
        : []),
    ],
    [transaction.sender, transaction.receiver, transaction.amount, transaction.closeRemainder]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>Payment</h1>
      </div>
      <DescriptionList items={paymentTransactionItems} />
    </div>
  )
}
