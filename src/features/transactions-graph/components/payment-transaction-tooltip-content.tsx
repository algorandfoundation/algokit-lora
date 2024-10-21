import { InnerPaymentTransaction, PaymentTransaction } from '@/features/transactions/models'
import { useMemo } from 'react'
import {
  transactionFeeLabel,
  transactionIdLabel,
  transactionRekeyToLabel,
  transactionTypeLabel,
} from '@/features/transactions/components/transaction-info'
import { asTransactionLinkTextComponent, TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionReceiverLabel, transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { transactionAmountLabel } from '@/features/transactions/components/transactions-table-columns'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionTypeDescriptionDetails } from '@/features/transactions/components/transaction-type-description-details'
import {
  transactionCloseRemainderAmountLabel,
  transactionCloseRemainderToLabel,
} from '@/features/transactions/components/payment-transaction-info'

type Props = {
  transaction: PaymentTransaction | InnerPaymentTransaction
  isSimulated: boolean
}

export function PaymentTransactionTooltipContent({ transaction, isSimulated }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: isSimulated ? asTransactionLinkTextComponent(transaction.id, true) : <TransactionLink transactionId={transaction.id} />,
      },
      {
        dt: transactionTypeLabel,
        dd: <TransactionTypeDescriptionDetails transaction={transaction} />,
      },
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
      {
        dt: transactionReceiverLabel,
        dd: <AccountLink address={transaction.receiver} />,
      },
      {
        dt: transactionAmountLabel,
        dd: <DisplayAlgo amount={transaction.amount} />,
      },
      {
        dt: transactionFeeLabel,
        dd: <DisplayAlgo amount={transaction.fee} />,
      },
      ...(transaction.closeRemainder
        ? [
            {
              dt: transactionCloseRemainderToLabel,
              dd: <AccountLink address={transaction.closeRemainder.to} />,
            },
            {
              dt: transactionCloseRemainderAmountLabel,
              dd: <DisplayAlgo amount={transaction.closeRemainder.amount} />,
            },
          ]
        : []),
      ...(transaction.rekeyTo
        ? [
            {
              dt: transactionRekeyToLabel,
              dd: <AccountLink address={transaction.rekeyTo} />,
            },
          ]
        : []),
    ],
    [isSimulated, transaction]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
