import { AppCallTransaction, InnerAppCallTransaction, TransactionType } from '@/features/transactions/models'
import { useMemo } from 'react'
import { transactionIdLabel, transactionTypeLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { applicationIdLabel } from '@/features/applications/components/labels'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'

export function AppCallTransactionTooltipContent({ transaction }: { transaction: AppCallTransaction | InnerAppCallTransaction }) {
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
            {TransactionType.ApplicationCall}
            {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
          </>
        ),
      },
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
      {
        dt: applicationIdLabel,
        dd: <ApplicationLink applicationId={transaction.applicationId} />,
      },
    ],
    [transaction.applicationId, transaction.id, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
