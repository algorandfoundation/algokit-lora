import { AssetHolding } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { accountAssetHoldingsTableColumns } from './account-asset-holdings-table-columns'

type Props = {
  assetsHeld: AssetHolding[]
}

export function AccountAssetsHeld({ assetsHeld }: Props) {
  return <DataTable columns={accountAssetHoldingsTableColumns} data={assetsHeld} />
}
