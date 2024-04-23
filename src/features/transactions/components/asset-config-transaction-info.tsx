import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetConfigTransactionModel, InnerAssetConfigTransactionModel } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel } from './transaction-view-table'

type Props = {
  transaction: AssetConfigTransactionModel | InnerAssetConfigTransactionModel
}

export const assetIdLabel = 'Asset ID'
export function AssetConfigTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.sender}
          </a>
        ),
      },
      {
        dt: assetIdLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.assetId}
          </a>
        ),
      },
    ],
    [transaction.assetId, transaction.sender]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>Asset Config</h1>
      </div>
      <DescriptionList items={items} />
    </div>
  )
}
