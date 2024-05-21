import { AssetHolding } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { accountAssetHoldingsTableColumns } from './account-asset-holdings-table-columns'

type Props = {
  assetsOpted: AssetHolding[]
}

export function AccountAssetsOpted({ assetsOpted }: Props) {
  return <DataTable columns={accountAssetHoldingsTableColumns} data={assetsOpted} />
}
