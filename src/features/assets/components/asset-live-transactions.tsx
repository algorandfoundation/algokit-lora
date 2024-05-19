import { AssetId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { getAssetIdsForTransaction } from '@/features/transactions/utils/get-asset-ids-for-transaction'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { getAssetTransactionsTableSubRows } from '../utils/get-asset-transactions-table-sub-rows'

type Props = {
  assetId: AssetId
}

export function AssetLiveTransactions({ assetId }: Props) {
  const filter = useCallback(
    (transactionResult: TransactionResult) => {
      const assetIdsForTransaction = getAssetIdsForTransaction(transactionResult)
      return assetIdsForTransaction.includes(assetId)
    },
    [assetId]
  )
  const getSubRows = useCallback((row: Transaction | InnerTransaction) => getAssetTransactionsTableSubRows(assetId, row), [assetId])
  return <LiveTransactionsTable filter={filter} getSubRows={getSubRows} columns={assetTransactionsTableColumns} />
}
