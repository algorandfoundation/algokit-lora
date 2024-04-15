import { AssetModel } from '@/features/assets/models'
import Decimal from 'decimal.js'

type Props = {
  amount: number | bigint
  asset: AssetModel
}

export const DisplayAssetAmount = ({ amount, asset }: Props) => {
  // asset decimals value must be from 0 to 19 so it is safe to use .toString() here
  const decimals = asset.decimals.toString()
  // the amount is uint64, should be safe to be .toString()
  const amountAsString = amount.toString()

  return (
    <div>
      {new Decimal(amountAsString).div(new Decimal(10).pow(decimals)).toString()} {asset.unitName ?? ''}
    </div>
  )
}
