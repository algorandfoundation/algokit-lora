import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetId } from '../data/types'
import { useFetchNextAssetTransactionsPage } from '../data/asset-transaction-history'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'
import { useCallback } from 'react'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

type Props = {
  assetId: AssetId
}

export function AssetTransactionHistory({ assetId }: Props) {
  const fetchNextPage = useFetchNextAssetTransactionsPage(assetId)

  const getSubRows = useCallback(
    (row: Transaction | InnerTransaction) => {
      if (row.type !== TransactionType.ApplicationCall || row.innerTransactions.length === 0) {
        return []
      }

      return row.innerTransactions.filter((innerTransaction) => {
        const txns = flattenInnerTransactions(innerTransaction)
        return txns.some(({ transaction }) => {
          return (
            (transaction.type === TransactionType.AssetTransfer && transaction.asset.id === assetId) ||
            (transaction.type === TransactionType.AssetConfig && transaction.assetId === assetId) ||
            (transaction.type === TransactionType.AssetFreeze && transaction.assetId === assetId)
          )
        })
      })
    },
    [assetId]
  )

  return <LazyLoadDataTable columns={assetTransactionsTableColumns} getSubRows={getSubRows} fetchNextPage={fetchNextPage} />
}
