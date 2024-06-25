import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetFreezeTransaction, InnerAssetFreezeTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AssetLink } from '@/features/assets/components/asset-link'
import { transactionSenderLabel } from './labels'

type Props = {
  transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction
}

export const assetLabel = 'Asset'
export const assetFreezeAddressLabel = 'Freeze Address'
export const assetFreezeStatusLabel = 'Freeze Status'

export function AssetFreezeTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} showCopyButton={true} />,
      },
      {
        dt: assetLabel,
        dd: <AssetLink asset={transaction.asset} showCopyButton={true} />,
      },
      {
        dt: assetFreezeAddressLabel,
        dd: <AccountLink address={transaction.address} showCopyButton={true} />,
      },
      {
        dt: assetFreezeStatusLabel,
        dd: transaction.freezeStatus,
      },
    ],
    [transaction.address, transaction.asset, transaction.freezeStatus, transaction.sender]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h2>Asset Freeze</h2>
      </div>
      <DescriptionList items={items} />
    </div>
  )
}
