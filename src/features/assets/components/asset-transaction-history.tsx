import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetIndex } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { useMemo } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { fetchTransactionsAtomBuilder, transactionResultsAtom } from '@/features/transactions/data'
import { Transaction, TransactionType } from '@/features/transactions/models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { cn } from '@/features/common/utils'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ColumnDef } from '@tanstack/react-table'
import { atomEffect } from 'jotai-effect'
import { atom, useStore } from 'jotai'

type Props = {
  assetIndex: AssetIndex
}

export function AssetTransactionHistory({ assetIndex }: Props) {
  const fetchNextPage = useFetchNextPage(assetIndex)

  return <LazyLoadDataTable columns={transactionsTableColumns} fetchNextPage={fetchNextPage} />
}

const fetchAssetTransactionResults = async (assetIndex: AssetIndex, pageSize: number, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .assetID(assetIndex)
    .nextToken(nextPageToken ?? '')
    .limit(pageSize)
    .do()) as TransactionSearchResults
  return {
    transactionResults: results.transactions,
    nextPageToken: results['next-token'],
  } as const
}

const syncEffectBuilder = (transactionResults: TransactionResult[]) => {
  return atomEffect((_, set) => {
    ;(async () => {
      try {
        set(transactionResultsAtom, (prev) => {
          const newMap = new Map(prev)
          transactionResults.forEach((transactionResult) => {
            newMap.set(transactionResult.id, transactionResult)
          })
          return newMap
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const fetchAssetTransactionAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex, pageSize: number, nextPageToken?: string) => {
  return atom(async (get) => {
    const { transactionResults, nextPageToken: newNextPageToken } = await fetchAssetTransactionResults(assetIndex, pageSize, nextPageToken)

    get(syncEffectBuilder(transactionResults))

    const transactions = await get(fetchTransactionsAtomBuilder(store, transactionResults))

    return {
      rows: transactions,
      nextPageToken: newNextPageToken,
    }
  })
}

const useFetchNextPage = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    return (pageSize: number, nextPageToken?: string) => fetchAssetTransactionAtomBuilder(store, assetIndex, pageSize, nextPageToken)
  }, [store, assetIndex])
}

const transactionsTableColumns: ColumnDef<Transaction>[] = [
  {
    header: 'Transaction Id',
    accessorKey: 'id',
    cell: (c) => {
      const value = c.getValue<string>()
      return <TransactionLink transactionId={value} short={true} />
    },
  },
  {
    accessorKey: 'sender',
    header: 'From',
    cell: (c) => ellipseAddress(c.getValue<string>()),
  },
  {
    header: 'To',
    accessorFn: (transaction) => {
      if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer)
        return ellipseAddress(transaction.receiver)
      if (transaction.type === TransactionType.ApplicationCall) return transaction.applicationId
      if (transaction.type === TransactionType.AssetConfig) return transaction.assetId
      if (transaction.type === TransactionType.AssetFreeze) return ellipseAddress(transaction.address)
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    header: 'Amount',
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
      if (transaction.type === TransactionType.Payment) return <DisplayAlgo className={cn('justify-center')} amount={transaction.amount} />
      if (transaction.type === TransactionType.AssetTransfer)
        return <DisplayAssetAmount amount={transaction.amount} asset={transaction.asset} />
    },
  },
]
