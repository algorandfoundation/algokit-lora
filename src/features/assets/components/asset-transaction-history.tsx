import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetId } from '../data/types'
import { useFetchNextAssetTransactionsPage } from '../data/asset-transaction-history'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'

type Props = {
  assetId: AssetId
}

export function AssetTransactionHistory({ assetId }: Props) {
  const fetchNextPage = useFetchNextAssetTransactionsPage(assetId)

  return <LazyLoadDataTable columns={assetTransactionsTableColumns} fetchNextPage={fetchNextPage} />
}
