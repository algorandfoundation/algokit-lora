import { AssetTransferTransaction, InnerAssetTransferTransaction, TransactionType } from '@/features/transactions/models'
import { useMemo } from 'react'
import { transactionIdLabel, transactionTypeLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionReceiverLabel, transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { transactionAmountLabel } from '@/features/transactions/components/transactions-table-columns'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'

export function AssetTransferTransactionTooltipContent({
  transaction,
}: {
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction
}) {
  const items = useMemo(
    () => [
      {
        dt: transactionIdLabel,
        dd: <TransactionLink transactionId={transaction.id} showCopyButton={true} />,
      },
      {
        dt: transactionTypeLabel,
        dd: (
          <>
            {TransactionType.AssetTransfer}
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
        dd: <DisplayAssetAmount asset={transaction.asset} amount={transaction.amount} />,
      },
    ],
    [transaction.amount, transaction.asset, transaction.id, transaction.receiver, transaction.rekeyTo, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
