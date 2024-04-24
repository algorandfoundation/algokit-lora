import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetFreezeTransaction, InnerAssetFreezeTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel } from './transaction-view-table'
import { AccountLink } from '@/features/accounts/components/account-link'

type Props = {
  transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction
}

export const assetLabel = 'Asset'
export const assetFreezeAddressLabel = 'Asset Freeze Address'
export const assetNewFreezeStatusLabel = 'New Freeze Status'

export function AssetFreezeTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender}></AccountLink>,
      },
      {
        dt: assetFreezeAddressLabel,
        dd: <AccountLink address={transaction.address}></AccountLink>,
      },
      {
        dt: assetLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.assetId}
            {`${transaction.assetName ? `(${transaction.assetName})` : ''}`}
          </a>
        ),
      },
      {
        dt: assetNewFreezeStatusLabel,
        dd: transaction.newFreezeStatus ? 'True' : 'False',
      },
    ],
    [transaction.address, transaction.assetId, transaction.assetName, transaction.newFreezeStatus, transaction.sender]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>Asset Freeze</h1>
      </div>
      <DescriptionList items={items} />
    </div>
  )
}
