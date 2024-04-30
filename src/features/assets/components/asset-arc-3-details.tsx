import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { cn } from '@/features/common/utils'
import { Arc3Asset } from '../models'
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
  assetDescriptionLabel,
  assetFreezeLabel,
  assetIdLabel,
  assetJsonLabel,
  assetManagerLabel,
  assetNameLabel,
  assetReserveLabel,
  assetTotalSupplyLabel,
  assetUnitNameLabel,
  assetUrlLabel,
} from './labels'
import { Badge } from '@/features/common/components/badge'

type Props = {
  asset: Arc3Asset
}

export function AssetArc3Details({ asset }: Props) {
  const assetItems = useMemo(
    () => [
      {
        dt: assetIdLabel,
        dd: asset.id,
      },
      asset.name
        ? {
            dt: assetNameLabel,
            dd: (
              <label>
                {asset.name}
                {/* TODO: ARC-16 */}
                <Badge variant="outline">ARC-3</Badge>
              </label>
            ),
          }
        : undefined,
      asset.metadata.description
        ? {
            dt: assetDescriptionLabel,
            dd: asset.metadata.description,
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
        dd: `${new Decimal(asset.total.toString()).div(new Decimal(10).pow(asset.decimals.toString()))} ${asset.unitName}`,
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
    [asset.decimals, asset.defaultFrozen, asset.id, asset.metadata.description, asset.name, asset.total, asset.unitName, asset.url]
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
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <div className={cn('grid grid-cols-[1fr_max-content]')}>
            <DescriptionList items={assetItems} />
            <div>
              {asset.metadata.image && <img src={asset.metadata.image} alt={asset.name} className={cn('w-32 h-32')} />}
              {asset.metadata.animationUrl && (
                <video title={asset.name} autoPlay playsInline loop controls muted>
                  <source src={asset.metadata.animationUrl} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{assetAddressesLabel}</h1>
          <DescriptionList items={assetAddresses} />
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{assetJsonLabel}</h1>
          <div className={cn('border-solid border-2 border-border h-96 grid')}>
            <pre className={cn('overflow-scroll p-4')}>{asset.json}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
