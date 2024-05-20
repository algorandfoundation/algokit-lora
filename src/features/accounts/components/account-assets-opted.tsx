import { ColumnDef } from '@tanstack/react-table'
import { AssetHolding } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { AssetLink } from '@/features/assets/components/asset-link'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'

type Props = {
  assetsOpted: AssetHolding[]
}

export const assetsHeldTableColumns: ColumnDef<AssetHolding>[] = [
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

export function AccountAssetsOpted({ assetsOpted }: Props) {
  if (assetsOpted.length === 0) {
    return <></>
  }

  return <DataTable columns={assetsHeldTableColumns} data={assetsOpted} />
}
