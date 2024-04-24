import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetConfigTransaction, InnerAssetConfigTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel } from './transaction-view-table'
import { AccountLink } from '@/features/accounts/components/account-link'
import { isDefined } from '@/utils/is-defined'

type Props = {
  transaction: AssetConfigTransaction | InnerAssetConfigTransaction
}

export const assetIdLabel = 'Asset ID'
export const assetUrlLabel = 'URL'
export const assetUnitLabel = 'Unit'
export const assetDecimalsLabel = 'Decimals'
export const assetTotalSupplyLabel = 'Total Supply'
export const assetManagerLabel = 'Manager'
export const assetReserveLabel = 'Reserve'
export const assetFreezeLabel = 'Freeze'
export const assetClawbackLabel = 'Clawback'
export const assetDefaultFrozenLabel = 'Default Frozen'

export function AssetConfigTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () =>
      [
        {
          dt: transactionSenderLabel,
          dd: <AccountLink address={transaction.sender} />,
        },
        {
          dt: assetIdLabel,
          dd: (
            <a href="#" className={cn('text-primary underline')}>
              {transaction.assetId}
              {transaction.name && ` (${transaction.name})`}
            </a>
          ),
        },
        transaction.url
          ? {
              dt: assetUrlLabel,
              dd: (
                <a href={transaction.url} className={cn('text-primary underline')}>
                  {transaction.url}
                </a>
              ),
            }
          : undefined,
        transaction.unitName
          ? {
              dt: assetUnitLabel,
              dd: transaction.unitName,
            }
          : undefined,
        transaction.decimals != null
          ? {
              dt: assetDecimalsLabel,
              dd: transaction.decimals.toString(),
            }
          : undefined,
        transaction.total != null
          ? {
              dt: assetTotalSupplyLabel,
              dd: transaction.total.toString(),
            }
          : undefined,
        transaction.manager
          ? {
              dt: assetManagerLabel,
              dd: <AccountLink address={transaction.manager} />,
            }
          : undefined,
        transaction.reserve
          ? {
              dt: assetReserveLabel,
              dd: <AccountLink address={transaction.reserve} />,
            }
          : undefined,
        transaction.freeze
          ? {
              dt: assetFreezeLabel,
              dd: <AccountLink address={transaction.freeze} />,
            }
          : undefined,
        transaction.clawback
          ? {
              dt: assetClawbackLabel,
              dd: <AccountLink address={transaction.clawback} />,
            }
          : undefined,
        transaction.defaultFrozen != null
          ? {
              dt: assetDefaultFrozenLabel,
              dd: transaction.defaultFrozen ? 'Yes' : 'No',
            }
          : undefined,
      ].filter(isDefined),
    [
      transaction.assetId,
      transaction.clawback,
      transaction.decimals,
      transaction.defaultFrozen,
      transaction.freeze,
      transaction.manager,
      transaction.name,
      transaction.reserve,
      transaction.sender,
      transaction.total,
      transaction.unitName,
      transaction.url,
    ]
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
