import { AssetModel } from '@/features/assets/models'
import Decimal from 'decimal.js'

type Props = {
  amount: Decimal
  asset: AssetModel
}

export const DisplayAssetAmount = ({ amount, asset }: Props) => {
  return (
    <div>
      {amount.toString()} {asset.unitName ?? ''}
    </div>
  )
}
