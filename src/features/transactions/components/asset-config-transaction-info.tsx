import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetConfigTransactionModel, InnerAssetConfigTransactionModel } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionSenderLabel } from './transaction-view-table'
import { AccountLink } from '@/features/accounts/components/account-link'
import { isDefined } from '@/utils/is-defined'

type Props = {
  transaction: AssetConfigTransactionModel | InnerAssetConfigTransactionModel
}

export const assetIdLabel = 'Asset ID'
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
              {transaction.assetId} {transaction.name && `(${transaction.name})`}
            </a>
          ),
        },
        ...(transaction.unitName
          ? [
              {
                dt: assetUnitLabel,
                dd: transaction.unitName,
              },
            ]
          : []),
        transaction.decimals != null
          ? {
              dt: assetDecimalsLabel,
              dd: transaction.decimals.toString(),
            }
          : undefined,
        transaction.total != null
          ? {
              dt: assetTotalSupplyLabel,
              dd: transaction.total.toString(), // TODO: test a large number
            }
          : undefined,
        transaction.manager
          ? {
              dt: assetManagerLabel,
              dd: <AccountLink accountId={transaction.manager} />,
            }
          : undefined,
        transaction.reserve
          ? {
              dt: assetReserveLabel,
              dd: <AccountLink accountId={transaction.reserve} />,
            }
          : undefined,
        transaction.freeze
          ? {
              dt: assetFreezeLabel,
              dd: <AccountLink accountId={transaction.freeze} />,
            }
          : undefined,
        transaction.clawback
          ? {
              dt: assetClawbackLabel,
              dd: <AccountLink accountId={transaction.clawback} />,
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
