import { ColumnDef } from '@tanstack/react-table'
import { AccountAssetSummary } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { AssetLink } from '@/features/assets/components/asset-link'

type Props = {
  assetsCreated: AccountAssetSummary[]
}

const assetsCreatedTableColumns: ColumnDef<AccountAssetSummary>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.id,
    cell: (c) => <AssetLink assetId={c.getValue<number>()} />,
  },
  {
    header: 'Name',
    accessorFn: (item) => item.name,
  },
  {
    header: 'Unit',
    accessorFn: (item) => item.unitName,
  },
]

export function AccountAssetsCreated({ assetsCreated }: Props) {
  return <DataTable columns={assetsCreatedTableColumns} data={assetsCreated} />
}
