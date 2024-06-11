import { InnerKeyRegTransaction, KeyRegTransaction } from '@/features/transactions/models'
import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'
import { transactionIdLabel, transactionTypeLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { Badge } from '@/features/common/components/badge'
import { transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'

export function KeyRegTransactionToolTipContent({ transaction }: { transaction: KeyRegTransaction | InnerKeyRegTransaction }) {
  const subType = useAtomValue(transaction.subType)
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: <TransactionLink transactionId={transaction.id} />,
      },
      {
        dt: transactionTypeLabel,
        dd: (
          <label>
            {transaction.type}
            <Badge variant="outline">{subType}</Badge>
          </label>
        ),
      },
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
    ],
    [subType, transaction.id, transaction.sender, transaction.type]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
