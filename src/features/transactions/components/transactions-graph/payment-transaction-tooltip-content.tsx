import { InnerPaymentTransaction, PaymentTransaction, TransactionType } from '@/features/transactions/models'
import { useMemo } from 'react'
import { transactionIdLabel, transactionTypeLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionReceiverLabel, transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { transactionAmountLabel } from '@/features/transactions/components/transactions-table-columns'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'

export function PaymentTransactionTooltipContent({ transaction }: { transaction: PaymentTransaction | InnerPaymentTransaction }) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: <TransactionLink transactionId={transaction.id} />,
      },
      {
        dt: transactionTypeLabel,
        dd: (
          <>
            {TransactionType.Payment}
            {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
          </>
        ),
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
    ],
    [transaction.amount, transaction.id, transaction.receiver, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
