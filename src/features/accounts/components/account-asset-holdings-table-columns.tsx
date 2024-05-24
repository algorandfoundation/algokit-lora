import { ColumnDef } from '@tanstack/react-table'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { AssetHolding } from '../models'
import { AssetLink } from '@/features/assets/components/asset-link'
import { RenderAsyncAtom } from '@/features/common/components/render-async-atom'
import { AssetSummary } from '@/features/assets/models'
import { Atom } from 'jotai'

export const accountAssetHoldingsTableColumns: ColumnDef<AssetHolding>[] = [
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
    header: 'Amount',
    accessorFn: (item) => item,
    cell: (c) => {
      const assetHolding = c.getValue<AssetHolding>()
      return <DisplayAssetAmount amount={assetHolding.amount} asset={assetHolding.asset} isFrozen={assetHolding.isFrozen} />
    },
  },
]
