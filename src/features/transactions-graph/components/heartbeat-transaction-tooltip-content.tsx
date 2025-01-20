import { useMemo } from 'react'
import {
  transactionFeeLabel,
  transactionIdLabel,
  transactionRekeyToLabel,
  transactionTypeLabel,
} from '@/features/transactions/components/transaction-info'
import { asTransactionLinkTextComponent, TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { TransactionTypeDescriptionDetails } from '@/features/transactions/components/transaction-type-description-details'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { HeartbeatTransaction } from '@/features/transactions/models'
import { heartbeatAddressLabel } from '@/features/transactions/components/heartbeat-transaction-info'

type Props = {
  transaction: HeartbeatTransaction
  isSimulated: boolean
}

export function HeartbeatTransactionTooltipContent({ transaction, isSimulated }: Props) {
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
        dt: heartbeatAddressLabel,
        dd: <AccountLink address={transaction.address} />,
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
    [isSimulated, transaction]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
