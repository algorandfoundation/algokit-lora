import { AssetSummary } from '@/features/assets/models'
import { cn } from '../utils'
import Decimal from 'decimal.js'
import { Badge } from './badge'
import { AsyncMaybeAtom } from '../data/types'
import { RenderInlineAsyncAtom } from './render-inline-async-atom'

type Props = {
  amount: number | bigint
  asset: AssetSummary | AsyncMaybeAtom<AssetSummary>
  isFrozen?: boolean
  className?: string
}

const Amount = ({ asset, amount, isFrozen }: { asset: AssetSummary; amount: number | bigint; isFrozen?: boolean }) => {
  // asset decimals value must be from 0 to 19 so it is safe to use .toString() here
  // the amount is uint64, should be safe to be .toString()
  const amountToDisplay = new Decimal(amount.toString()).div(new Decimal(10).pow(asset.decimals.toString())).toString()

  return (
    <>
      {amountToDisplay} {asset.unitName ?? ''}
      {isFrozen && <Badge variant="outline">Frozen</Badge>}
    </>
  )
}

export const DisplayAssetAmount = ({ amount, asset, isFrozen, className }: Props) => {
  return (
    <div className={cn(className)}>
      {'read' in asset ? (
        <RenderInlineAsyncAtom atom={asset}>
          {(asset) => <Amount asset={asset} amount={amount} isFrozen={isFrozen} />}
        </RenderInlineAsyncAtom>
      ) : (
        <Amount asset={asset} amount={amount} isFrozen={isFrozen} />
      )}
    </div>
  )
}
