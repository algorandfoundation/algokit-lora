import { AssetSummary } from '@/features/assets/models'
import { cn } from '../utils'
import Decimal from 'decimal.js'

type Props = {
  amount: number | bigint
  asset: AssetSummary
  className?: string
}

export const DisplayAssetAmount = ({ amount, asset, className }: Props) => {
  // asset decimals value must be from 0 to 19 so it is safe to use .toString() here
  // the amount is uint64, should be safe to be .toString()
  const amountToDisplay = new Decimal(amount.toString()).div(new Decimal(10).pow(asset.decimals.toString())).toString()

  return (
    <div className={cn(className)}>
      {amountToDisplay} {asset.unitName ?? ''}
    </div>
  )
}
