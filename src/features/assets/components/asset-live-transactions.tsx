import { AssetId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { assetTransactionsTableColumns } from '../utils/asset-transactions-table-columns'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionAtom } from '@/features/transactions/data'
import { atom } from 'jotai'
import { getAssetIdsForTransaction } from '@/features/transactions/utils/get-asset-ids-for-transaction'
import { extractTransactionsForAsset } from '../utils/extract-transactions-for-asset'
import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'

type Props = {
  assetId: AssetId
}

export function AssetLiveTransactions({ assetId }: Props) {
  const mapper = useCallback(
    (store: JotaiStore, transactionResult: TransactionResult) => {
      return atom(async (get) => {
        const assetIdsForTransaction = getAssetIdsForTransaction(transactionResult)
        if (!assetIdsForTransaction.includes(assetId)) return []

        const transaction = await get(createTransactionAtom(store, transactionResult))
        return [transaction]
      })
    },
    [assetId]
  )
  const getSubRows = useCallback((row: Transaction | InnerTransaction) => {
    if (row.type !== TransactionType.ApplicationCall || row.innerTransactions.length === 0) {
      return []
    }

    return row.innerTransactions
  }, [])
  return <LiveTransactionsTable mapper={mapper} getSubRows={getSubRows} columns={assetTransactionsTableColumns} />
}
