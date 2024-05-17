import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetId } from '../data/types'
import { useFetchNextAssetTransactionsPage } from '../data/asset-transaction-history'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'
import { useCallback } from 'react'

type Props = {
  assetId: AssetId
}

export function AssetTransactionHistory({ assetId }: Props) {
  const fetchNextPage = useFetchNextAssetTransactionsPage(assetId)

  const getSubRows = useCallback((row: Transaction | InnerTransaction) => {
    if (row.type !== TransactionType.ApplicationCall || row.innerTransactions.length === 0) {
      return []
    }

    return [row.innerTransactions[0]]
  }, [])

  return <LazyLoadDataTable columns={assetTransactionsTableColumns} getSubRows={getSubRows} fetchNextPage={fetchNextPage} />
}
