import { AssetIndex } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { JotaiStore } from '@/features/common/data/types'
import { fetchTransactionAtomBuilder } from '@/features/transactions/data'
import { atom } from 'jotai'
import { getAssetIdsForTransaction } from '@/features/transactions/utils/get-asset-ids-for-transaction'
import { TransactionType } from '@/features/transactions/models'

type Props = {
  assetIndex: AssetIndex
}

export function AssetLiveTransactions({ assetIndex }: Props) {
  const mapper = useCallback(
    (store: JotaiStore, transactionResult: TransactionResult) => {
      return atom(async (get) => {
        const assetIdsForTransaction = getAssetIdsForTransaction(transactionResult)
        if (!assetIdsForTransaction.includes(assetIndex)) return []

        // this is wrong, it always fetch the asset all the time :(
        const networkTransaction = await get(fetchTransactionAtomBuilder(store, transactionResult))
        const flattenTransactions = flattenInnerTransactions(networkTransaction)
        const results = []

        for (const { transaction } of flattenTransactions) {
          if (transaction.type === TransactionType.AssetConfig && transaction.assetId === assetIndex) {
            results.push(transaction)
          }
          if (transaction.type === TransactionType.AssetTransfer && transaction.asset.id === assetIndex) {
            results.push(transaction)
          }
          if (transaction.type === TransactionType.AssetFreeze && transaction.assetId === assetIndex) {
            results.push(transaction)
          }
        }
        return results
      })
    },
    [assetIndex]
  )
  return <LiveTransactionsTable mapper={mapper} columns={assetTransactionsTableColumns} />
}
