import { AssetSummary } from '@/features/assets/models'
import { cn } from '../utils'
import Decimal from 'decimal.js'
import { Badge } from './badge'
import { AsyncMaybeAtom } from '../data/types'
import { RenderInlineAsyncAtom } from './render-inline-async-atom'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { compactAmount } from '@/utils/compact-amount'

export const asAssetDisplayAmount = (amount: number | bigint, decimals: number, short: boolean = false) => {
  // asset decimals value must be from 0 to 19 so it is safe to use .toString() here
  // the amount is uint64, should be safe to be .toString()
  const displayAmount = new Decimal(amount.toString()).div(new Decimal(10).pow(decimals))
  return short ? compactAmount(displayAmount) : displayAmount.toString()
}

type AmountProps = {
  asset: AssetSummary
  amount: number | bigint
  isFrozen?: boolean
  linkClassName?: string
  short?: boolean
}

const Amount = ({ asset, amount, isFrozen, linkClassName, short }: AmountProps) => {
  const amountToDisplay = asAssetDisplayAmount(amount, asset.decimals, short)

  return (
    <div className="flex items-center gap-1">
      <span>{amountToDisplay}</span>
      {asset.unitName ? (
        <AssetIdLink assetId={asset.id} className={cn('underline', linkClassName ?? 'text-primary')}>
          {asset.unitName}
        </AssetIdLink>
      ) : undefined}
      {isFrozen && <Badge variant="outline">Frozen</Badge>}
    </div>
  )
}

type Props = {
  amount: number | bigint
  asset: AssetSummary | AsyncMaybeAtom<AssetSummary>
  isFrozen?: boolean
  className?: string
  linkClassName?: string
  short?: boolean
}

export const DisplayAssetAmount = ({ amount, asset, isFrozen, className, linkClassName, short }: Props) => {
  return (
    <div className={cn(className)}>
      {'read' in asset ? (
        <RenderInlineAsyncAtom atom={asset}>
          {(asset) => <Amount asset={asset} amount={amount} isFrozen={isFrozen} linkClassName={linkClassName} short={short} />}
        </RenderInlineAsyncAtom>
      ) : (
        <Amount asset={asset} amount={amount} isFrozen={isFrozen} linkClassName={linkClassName} short={short} />
      )}
    </div>
  )
}
