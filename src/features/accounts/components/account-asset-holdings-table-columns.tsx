import { ColumnDef } from '@tanstack/react-table'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { AssetHolding } from '../models'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { AssetSummary } from '@/features/assets/models'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'

export const accountAssetHoldingsTableColumns: ColumnDef<AssetHolding>[] = [
  {
    header: 'ID',
    accessorFn: (item) => item.assetId,
    cell: (c) => <AssetIdLink assetId={c.getValue<number>()} />,
  },
  {
    header: 'Name',
    accessorFn: (item) => item.asset,
    cell: (c) => {
      const assetSummaryAtom = c.getValue<AsyncMaybeAtom<AssetSummary>>()
      return <RenderInlineAsyncAtom atom={assetSummaryAtom}>{(asset) => asset.name}</RenderInlineAsyncAtom>
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
