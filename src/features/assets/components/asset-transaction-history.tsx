import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetId } from '../data/types'
import { useFetchNextAssetTransactionsPage } from '../data/asset-transaction-history'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { Transaction, InnerTransaction } from '@/features/transactions/models'
import { useCallback } from 'react'
import { getAssetTransactionsTableSubRows } from '../utils/get-asset-transactions-table-sub-rows'

type Props = {
  assetId: AssetId
}

export function AssetTransactionHistory({ assetId }: Props) {
  const fetchNextPage = useFetchNextAssetTransactionsPage(assetId)
  const getSubRows = useCallback((row: Transaction | InnerTransaction) => getAssetTransactionsTableSubRows(assetId, row), [assetId])

  return <LazyLoadDataTable columns={assetTransactionsTableColumns} getSubRows={getSubRows} fetchNextPage={fetchNextPage} />
}
