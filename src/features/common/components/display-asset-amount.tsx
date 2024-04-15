import { AssetModel } from '@/features/assets/models'
import { cn } from '../utils'
import Decimal from 'decimal.js'

type Props = {
  amount: number | bigint | undefined
  asset: AssetModel
  className?: string
}

export const DisplayAssetAmount = ({ amount, asset, className }: Props) => {
  // asset decimals value must be from 0 to 19 so it is safe to use .toString() here
  // the amount is uint64, should be safe to be .toString()
  const amountToDisplay = amount ? new Decimal(amount.toString()).div(new Decimal(10).pow(asset.decimals.toString())).toString() : '0'

  return (
    <div className={cn(className)}>
      {amountToDisplay} {asset.unitName ?? ''}
    </div>
  )
}
