import { AssetId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { getAssetIdsForTransaction } from '@/features/transactions/utils/get-asset-ids-for-transaction'
import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

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
  return <LiveTransactionsTable filter={filter} getSubRows={getSubRows} columns={assetTransactionsTableColumns} />
}
