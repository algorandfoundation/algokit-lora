import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetId } from '../data/types'
import { createLoadableAssetTransactionsPage } from '../data/asset-transaction-history'
import { Transaction, InnerTransaction } from '@/features/transactions/models'
import { useCallback, useMemo } from 'react'
import { getAssetTransactionsTableSubRows } from '../utils/get-asset-transactions-table-sub-rows'
import { transactionsTableColumnsWithCollapsibleSubRows } from '@/features/transactions/components/transactions-table-columns'

type Props = {
  assetId: AssetId
}

export function AssetTransactionHistory({ assetId }: Props) {
  const createLoadablePage = useMemo(() => createLoadableAssetTransactionsPage(assetId), [assetId])
  const getSubRows = useCallback((row: Transaction | InnerTransaction) => getAssetTransactionsTableSubRows(assetId, row), [assetId])

  return (
    <LazyLoadDataTable
      columns={transactionsTableColumnsWithCollapsibleSubRows}
      collapsible={true}
      getSubRows={getSubRows}
      createLoadablePage={createLoadablePage}
    />
  )
}
