import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AssetConfigTransaction, AssetConfigTransactionSubType, InnerAssetConfigTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { isDefined } from '@/utils/is-defined'
import { AssetIdAndNameLink } from '@/features/assets/components/asset-link'
import Decimal from 'decimal.js'
import { transactionSenderLabel } from './labels'
import { replaceIpfsWithGatewayIfNeeded } from '@/features/assets/utils/replace-ipfs-with-gateway-if-needed'
import { addHttpsSchemeIfNeeded } from '@/features/assets/utils/add-https-scheme-if-needed'

type Props = {
  transaction: AssetConfigTransaction | InnerAssetConfigTransaction
}

export const assetLabel = 'Asset'
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
  const subType = transaction.subType
  const items = useMemo(
    () =>
      [
        {
          dt: transactionSenderLabel,
          dd: <AccountLink address={transaction.sender} showCopyButton={true} />,
        },
        {
          dt: assetLabel,
          dd: <AssetIdAndNameLink assetId={transaction.assetId} assetName={transaction.name} showCopyButton={true} />,
        },
        transaction.url
          ? {
              dt: assetUrlLabel,
              dd: (
                <a
                  href={addHttpsSchemeIfNeeded(replaceIpfsWithGatewayIfNeeded(transaction.url))}
                  className={cn('text-primary underline')}
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                >
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
        ...(subType === AssetConfigTransactionSubType.Create
          ? [
              transaction.total != null
                ? {
                    dt: assetTotalSupplyLabel,
                    dd: `${new Decimal(transaction.total.toString()).div(new Decimal(10).pow((transaction.decimals ?? 0).toString()))} ${transaction.unitName}`,
                  }
                : undefined,
              transaction.decimals != null
                ? {
                    dt: assetDecimalsLabel,
                    dd: transaction.decimals.toString(),
                  }
                : undefined,
            ]
          : []),
        transaction.manager
          ? {
              dt: assetManagerLabel,
              dd: <AccountLink address={transaction.manager} showCopyButton={true} />,
            }
          : undefined,
        transaction.reserve
          ? {
              dt: assetReserveLabel,
              dd: <AccountLink address={transaction.reserve} showCopyButton={true} />,
            }
          : undefined,
        transaction.freeze
          ? {
              dt: assetFreezeLabel,
              dd: <AccountLink address={transaction.freeze} showCopyButton={true} />,
            }
          : undefined,
        transaction.clawback
          ? {
              dt: assetClawbackLabel,
              dd: <AccountLink address={transaction.clawback} showCopyButton={true} />,
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
      subType,
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
        <h2>Asset Config</h2>
      </div>
      <DescriptionList items={items} />
    </div>
  )
}
