import { StateProofTransaction } from '@/features/transactions/models'
import { useMemo } from 'react'
import { transactionIdLabel, transactionTypeLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { Badge } from '@/features/common/components/badge'
import { transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'

export function StateProofTransactionTooltipContent({ transaction }: { transaction: StateProofTransaction }) {
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
            {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
          </label>
        ),
      },
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
    ],
    [transaction.id, transaction.rekeyTo, transaction.sender, transaction.type]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
