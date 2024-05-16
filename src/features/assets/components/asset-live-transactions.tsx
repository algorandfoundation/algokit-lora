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
        return extractTransactionsForAsset(transaction, assetId)
      })
    },
    [assetId]
  )
  return <LiveTransactionsTable mapper={mapper} columns={assetTransactionsTableColumns} />
}
