import { AppCallTransaction, InnerAppCallTransaction } from '@/features/transactions/models'
import { useMemo } from 'react'
import {
  transactionFeeLabel,
  transactionIdLabel,
  transactionRekeyToLabel,
  transactionTypeLabel,
} from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { applicationIdLabel } from '@/features/applications/components/labels'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionTypeDescriptionDetails } from '@/features/transactions/components/transaction-type-description-details'
import { DisplayAlgo } from '@/features/common/components/display-algo'

export function AppCallTransactionTooltipContent({ transaction }: { transaction: AppCallTransaction | InnerAppCallTransaction }) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: <TransactionLink transactionId={transaction.id} />,
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
        dt: applicationIdLabel,
        dd: <ApplicationLink applicationId={transaction.applicationId} />,
      },
      {
        dt: transactionFeeLabel,
        dd: <DisplayAlgo amount={transaction.fee} />,
      },
      ...(transaction.rekeyTo
        ? [
            {
              dt: transactionRekeyToLabel,
              dd: <AccountLink address={transaction.rekeyTo} />,
            },
          ]
        : []),
    ],
    [transaction]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
