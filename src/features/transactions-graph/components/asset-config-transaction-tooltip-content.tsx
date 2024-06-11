import { AssetConfigTransaction, InnerAssetConfigTransaction, TransactionType } from '@/features/transactions/models'
import { useMemo } from 'react'
import { transactionIdLabel, transactionTypeLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { transactionSenderLabel } from '@/features/transactions/components/labels'
import { AccountLink } from '@/features/accounts/components/account-link'
import { assetLabel } from '@/features/transactions/components/asset-config-transaction-info'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'

export function AssetConfigTransactionTooltipContent({
  transaction,
}: {
  transaction: AssetConfigTransaction | InnerAssetConfigTransaction
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
            {TransactionType.AssetConfig}
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
    ],
    [transaction.assetId, transaction.id, transaction.sender]
  )

  return (
    <div className={cn('p-4')}>
      <DescriptionList items={items} />
    </div>
  )
}
