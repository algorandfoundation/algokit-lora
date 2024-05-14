import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetIndex } from '../data/types'
import { useFetchNextAssetTransactionsPage } from '../data/asset-transaction-history'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'

type Props = {
  assetIndex: AssetIndex
}

export function AssetTransactionHistory({ assetIndex }: Props) {
  const fetchNextPage = useFetchNextAssetTransactionsPage(assetIndex)

  return <LazyLoadDataTable columns={assetTransactionsTableColumns} fetchNextPage={fetchNextPage} />
}
