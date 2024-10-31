import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { AccountAssetSummary } from '../models'
import { AssetSummary } from '@/features/assets/models'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import { Atom } from 'jotai'

type Props = {
  assetsCreated: AccountAssetSummary[]
}

const assetsCreatedTableColumns: ColumnDef<AccountAssetSummary>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.assetId,
    cell: (c) => <AssetIdLink assetId={c.getValue<number>()} />,
  },
  {
    header: 'Name',
    accessorFn: (item) => item.asset,
    cell: (c) => {
      const assetSummaryAtom = c.getValue<Atom<Promise<AssetSummary>>>()
      return <RenderInlineAsyncAtom atom={assetSummaryAtom}>{(asset) => asset.name}</RenderInlineAsyncAtom>
    },
  },
  {
    header: 'Unit',
    accessorFn: (item) => item.asset,
    cell: (c) => {
      const assetSummaryAtom = c.getValue<Atom<Promise<AssetSummary>>>()
      return <RenderInlineAsyncAtom atom={assetSummaryAtom}>{(asset) => asset.unitName}</RenderInlineAsyncAtom>
    },
  },
]

export function AccountAssetsCreated({ assetsCreated }: Props) {
  return <DataTable columns={assetsCreatedTableColumns} data={assetsCreated} />
}
