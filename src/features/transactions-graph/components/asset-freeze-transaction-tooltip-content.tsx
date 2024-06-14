import { AssetFreezeTransaction, InnerAssetFreezeTransaction, TransactionType } from '@/features/transactions/models'
import { useMemo } from 'react'
import { transactionIdLabel, transactionTypeLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { assetLabel } from '@/features/transactions/components/asset-config-transaction-info'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { assetFreezeAddressLabel, assetFreezeStatusLabel } from '@/features/transactions/components/asset-freeze-transaction-info'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'

export function AssetFreezeTransactionTooltipContent({
  transaction,
}: {
  transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction
}) {
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
            <Badge className="ml-0" variant={TransactionType.AssetFreeze}>
              {TransactionType.AssetFreeze}
            </Badge>
            {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
          </>
        ),
      },
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} />,
      },
      {
        dt: assetLabel,
        dd: <AssetIdLink assetId={transaction.assetId} />,
      },
      {
        dt: assetFreezeAddressLabel,
        dd: <AccountLink address={transaction.address} />,
      },
      {
        dt: assetFreezeStatusLabel,
        dd: transaction.freezeStatus,
      },
    ],
    [transaction.address, transaction.assetId, transaction.freezeStatus, transaction.id, transaction.rekeyTo, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
