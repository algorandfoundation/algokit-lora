import { AssetIndex } from '../data/types'
import { useCallback } from 'react'
import { getAssetIdsForTransaction } from '@/features/transactions/utils/get-asset-ids-for-transaction'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

type Props = {
  assetIndex: AssetIndex
}

export function AssetLiveTransactions({ assetIndex }: Props) {
  const filter = useCallback(
    (transactionResult: TransactionResult) => {
      const assetIdsForTransaction = getAssetIdsForTransaction(transactionResult)
      return assetIdsForTransaction.includes(assetIndex)
    },
    [assetIndex]
  )
  return <LiveTransactionsTable filter={filter} columns={assetTransactionsTableColumns} />
}
