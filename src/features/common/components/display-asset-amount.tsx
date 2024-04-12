import { AssetModel } from '@/features/assets/models'

type Props = {
  amount: number
  asset: AssetModel
}

export const DisplayAssetAmount = ({ amount, asset }: Props) => {
  return (
    <div>
      {amount} {asset.unitName ?? ''}
    </div>
  )
}
