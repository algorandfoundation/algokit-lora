import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { cn } from '@/features/common/utils'
import { Asset } from '../models'
import { isDefined } from '@/utils/is-defined'
import Decimal from 'decimal.js'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ZERO_ADDRESS } from '@/features/common/constants'
import {
  assetAddressesLabel,
  assetClawbackLabel,
  assetCreatorLabel,
  assetDecimalsLabel,
  assetDefaultFrozenLabel,
  assetDetailsLabel,
  assetFreezeLabel,
  assetIdLabel,
  assetJsonLabel,
  assetManagerLabel,
  assetNameLabel,
  assetReserveLabel,
  assetTotalSupplyLabel,
  assetTransactionsLabel,
  assetUnitNameLabel,
  assetUrlLabel,
} from './labels'
import { Badge } from '@/features/common/components/badge'
import { AssetMedia } from './asset-media'
import { AssetTraits } from './asset-traits'
import { AssetMetadata } from './asset-metadata'

type Props = {
  asset: Asset
}

export function AssetDetails({ asset }: Props) {
  const assetItems = useMemo(
    () => [
      {
        dt: assetIdLabel,
        dd: (
          <>
            <span>{asset.id}</span>
            {asset.standardsUsed.map((s, i) => (
              <Badge key={i} variant="outline">
                {s}
              </Badge>
            ))}
            <Badge variant="outline">{asset.type}</Badge>
          </>
        ),
      },
      asset.name
        ? {
            dt: assetNameLabel,
            dd: asset.name,
          }
        : undefined,
      asset.unitName
        ? {
            dt: assetUnitNameLabel,
            dd: asset.unitName,
          }
        : undefined,
      {
        dt: assetTotalSupplyLabel,
        dd: `${new Decimal(asset.total.toString()).div(new Decimal(10).pow(asset.decimals.toString()))} ${asset.unitName ?? ''}`,
      },
      {
        dt: assetDecimalsLabel,
        dd: asset.decimals.toString(),
      },
      {
        dt: assetDefaultFrozenLabel,
        dd: asset.defaultFrozen ? 'Yes' : 'No',
      },
      asset.url
        ? {
            dt: assetUrlLabel,
            dd: (
              <a href={asset.url} className={cn('text-primary underline')}>
                {asset.url}
              </a>
            ),
          }
        : undefined,
    ],
    [asset.id, asset.name, asset.standardsUsed, asset.type, asset.unitName, asset.total, asset.decimals, asset.defaultFrozen, asset.url]
  ).filter(isDefined)

  const assetAddresses = useMemo(
    () => [
      {
        dt: assetCreatorLabel,
        dd: <AccountLink address={asset.creator} />,
      },
      asset.manager && asset.manager !== ZERO_ADDRESS
        ? {
            dt: assetManagerLabel,
            dd: <AccountLink address={asset.manager} />,
          }
        : undefined,
      asset.reserve && asset.reserve !== ZERO_ADDRESS
        ? {
            dt: assetReserveLabel,
            dd: <AccountLink address={asset.reserve} />,
          }
        : undefined,
      asset.freeze && asset.freeze !== ZERO_ADDRESS
        ? {
            dt: assetFreezeLabel,
            dd: <AccountLink address={asset.freeze} />,
          }
        : undefined,
      asset.clawback && asset.clawback !== ZERO_ADDRESS
        ? {
            dt: assetClawbackLabel,
            dd: <AccountLink address={asset.clawback} />,
          }
        : undefined,
    ],
    [asset.clawback, asset.creator, asset.freeze, asset.manager, asset.reserve]
  ).filter(isDefined)

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card aria-label={assetDetailsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <div className={cn('grid grid-cols-[1fr_max-content]')}>
            <DescriptionList items={assetItems} />
            <AssetMedia asset={asset} />
          </div>
        </CardContent>
      </Card>
      {asset.id !== 0 && (
        <>
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-2')}>
              <h1 className={cn('text-2xl text-primary font-bold')}>{assetAddressesLabel}</h1>
              <DescriptionList items={assetAddresses} />
            </CardContent>
          </Card>

          <AssetMetadata metadata={asset.metadata} />
          <AssetTraits traits={asset.traits} />
          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-2')}>
              <h1 className={cn('text-2xl text-primary font-bold')}>{assetJsonLabel}</h1>
              <div className={cn('border-solid border-2 border-border h-96 grid')}>
                <pre className={cn('overflow-scroll p-4')}>{asset.json}</pre>
              </div>
            </CardContent>
          </Card>

          <Card className={cn('p-4')}>
            <CardContent className={cn('text-sm space-y-2')}>
              <h1 className={cn('text-2xl text-primary font-bold')}>{assetTransactionsLabel}</h1>
              <div className={cn('border-solid border-2 grid p-4')}>{/* <TransactionsTable transactions={asset.transactions} /> */}</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
