import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { useMemo } from 'react'
import { InnerPaymentTransaction, PaymentTransaction } from '../models'
import { transactionAmountLabel, transactionReceiverLabel, transactionSenderLabel } from './transactions-table'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'

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
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.receiver}
          </a>
        ),
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAlgo amount={transaction.amount} />,
      },
      ...(transaction.closeRemainder
        ? [
            {
              dt: transactionCloseRemainderToLabel,
              dd: (
                <a href="#" className={cn('text-primary underline')}>
                  {transaction.closeRemainder.to}
                </a>
              ),
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
