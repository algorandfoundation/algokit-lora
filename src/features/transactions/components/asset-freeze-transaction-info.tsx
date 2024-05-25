import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetFreezeTransaction, InnerAssetFreezeTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel } from './transactions-table'
import { AccountLink } from '@/features/accounts/components/account-link'
import { AssetLink } from '@/features/assets/components/asset-link'

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
        dd: <AccountLink address={transaction.sender}></AccountLink>,
      },
      {
        dt: assetLabel,
        dd: <AssetLink assetId={transaction.assetId} assetName={transaction.assetName} />,
      },
      {
        dt: assetFreezeAddressLabel,
        dd: <AccountLink address={transaction.address}></AccountLink>,
      },
      {
        dt: assetFreezeStatusLabel,
        dd: transaction.freezeStatus,
      },
    ],
    [transaction.address, transaction.assetId, transaction.assetName, transaction.freezeStatus, transaction.sender]
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
