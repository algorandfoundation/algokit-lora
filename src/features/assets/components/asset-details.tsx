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
  assetHistoricalTransactionsTabId,
  assetHistoricalTransactionsTabLabel,
  assetIdLabel,
  assetLiveTransactionsTabId,
  assetLiveTransactionsTabLabel,
  assetManagerLabel,
  assetNameLabel,
  assetReserveLabel,
  assetTotalSupplyLabel,
  assetActivityLabel,
  assetUnitNameLabel,
  assetUrlLabel,
} from './labels'
import { Badge } from '@/features/common/components/badge'
import { AssetMedia } from './asset-media'
import { AssetTraits } from './asset-traits'
import { AssetMetadata } from './asset-metadata'
import { AssetTransactionHistory } from './asset-transaction-history'
import { AssetLiveTransactions } from './asset-live-transactions'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'

type Props = {
  asset: Asset
}

const expandAssetJsonLevel = (level: number) => {
  return level < 2
}

export function AssetDetails({ asset }: Props) {
  const assetItems = useMemo(
    () => [
      {
        dt: assetIdLabel,
        dd: (
          <div className="flex items-center gap-2">
            <span>{asset.id}</span>
            {asset.standardsUsed.map((s, i) => (
              <Badge key={i} variant="outline">
                {s}
              </Badge>
            ))}
            <Badge variant="outline">{asset.type}</Badge>
          </div>
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
        dd: `${new Decimal(asset.total.toString()).div(new Decimal(10).pow(asset.decimals))} ${asset.unitName ?? ''}`,
      },
      {
        dt: assetDecimalsLabel,
        dd: asset.decimals,
      },
      {
        dt: assetDefaultFrozenLabel,
        dd: asset.defaultFrozen ? 'Yes' : 'No',
      },
      asset.url
        ? {
            dt: assetUrlLabel,
            dd: (
              <a href={replaceIpfsWithGatewayIfNeeded(asset.url)} className={cn('text-primary underline')} rel="nofollow" target="_blank">
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
    <div className={cn('space-y-4')}>
      <Card aria-label={assetDetailsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm')}>
          <div className={cn('grid grid-cols-[1fr_max-content]')}>
            <DescriptionList items={assetItems} />
            <div className="ml-2 grid gap-2">
              <OpenJsonViewDialogButton json={asset.json} expandJsonLevel={expandAssetJsonLevel} />
              <AssetMedia asset={asset} />
            </div>
          </div>
        </CardContent>
      </Card>
      {asset.id !== 0 && (
        <>
          <Card className={cn('px-4 pb-4 pt-2')}>
            <CardContent className={cn('text-sm space-y-1')}>
              <h2>{assetAddressesLabel}</h2>
              <DescriptionList items={assetAddresses} />
            </CardContent>
          </Card>

          <AssetMetadata metadata={asset.metadata} />
          <AssetTraits traits={asset.traits} />

          <Card className={cn('px-4 pb-4 pt-2')}>
            <CardContent className={cn('text-sm space-y-1')}>
              <h2>{assetActivityLabel}</h2>
              <Tabs defaultValue={assetLiveTransactionsTabId}>
                <TabsList aria-label={assetActivityLabel}>
                  <TabsTrigger className="w-48" value={assetLiveTransactionsTabId}>
                    {assetLiveTransactionsTabLabel}
                  </TabsTrigger>
                  <TabsTrigger className="w-48" value={assetHistoricalTransactionsTabId}>
                    {assetHistoricalTransactionsTabLabel}
                  </TabsTrigger>
                </TabsList>
                <OverflowAutoTabsContent value={assetLiveTransactionsTabId}>
                  <AssetLiveTransactions assetId={asset.id} />
                </OverflowAutoTabsContent>
                <OverflowAutoTabsContent value={assetHistoricalTransactionsTabId}>
                  <AssetTransactionHistory assetId={asset.id} />
                </OverflowAutoTabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
