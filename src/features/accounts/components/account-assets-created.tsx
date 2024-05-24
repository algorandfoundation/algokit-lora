import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { AssetLink } from '@/features/assets/components/asset-link'
import { AccountAssetSummary } from '../models'
import { Atom } from 'jotai'
import { AssetSummary } from '@/features/assets/models'
import { RenderAsyncAtom } from '@/features/common/components/render-async-atom'

type Props = {
  assetsCreated: AccountAssetSummary[]
}

const assetsCreatedTableColumns: ColumnDef<AccountAssetSummary>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.assetId,
    cell: (c) => <AssetLink assetId={c.getValue<number>()} />,
  },
  {
    header: 'Name',
    accessorFn: (item) => item.asset,
    cell: (c) => {
      const assetSummaryAtom = c.getValue<Atom<Promise<AssetSummary> | AssetSummary>>()
      return (
        <RenderAsyncAtom atom={assetSummaryAtom} fallback="...">
          {(asset) => asset.name}
        </RenderAsyncAtom>
      )
    },
  },
  {
    header: 'Unit',
    accessorFn: (item) => item.asset,
    cell: (c) => {
      const assetSummaryAtom = c.getValue<Atom<Promise<AssetSummary> | AssetSummary>>()
      return (
        <RenderAsyncAtom atom={assetSummaryAtom} fallback="...">
          {(asset) => asset.unitName}
        </RenderAsyncAtom>
      )
    },
  },
]

export function AccountAssetsCreated({ assetsCreated }: Props) {
  return <DataTable columns={assetsCreatedTableColumns} data={assetsCreated} />
}
