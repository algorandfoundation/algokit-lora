import { ColumnDef } from '@tanstack/react-table'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { AssetHolding } from '../models'
import { AssetLink } from '@/features/assets/components/asset-link'

export const accountAssetHoldingsTableColumns: ColumnDef<AssetHolding>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.asset.id,
    cell: (c) => <AssetLink assetId={c.getValue<number>()} />,
  },
  {
    header: 'Name',
    accessorFn: (item) => item.asset.name,
  },
  {
    header: 'Amount',
    accessorFn: (item) => item,
    cell: (c) => {
      const assetHolding = c.getValue<AssetHolding>()
      return <DisplayAssetAmount amount={assetHolding.amount} asset={assetHolding.asset} isFrozen={assetHolding.isFrozen} />
    },
  },
]
