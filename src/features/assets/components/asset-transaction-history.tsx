import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetIndex } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { atom, useAtomValue, useStore } from 'jotai'
import { loadable } from 'jotai/utils'
import { useMemo, useState } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { fetchTransactionsAtomBuilder } from '@/features/transactions/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Transaction, TransactionType } from '@/features/transactions/models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { cn } from '@/features/common/utils'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ColumnDef } from '@tanstack/react-table'

type Props = {
  assetIndex: AssetIndex
}

export function AssetTransactionHistory({ assetIndex }: Props) {
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined)
  const loadableTransactions = useLoadableAssetTransactions(assetIndex, nextPageToken)

  return (
    <RenderLoadable loadable={loadableTransactions}>
      {(assetTransactionsAtomValue) => (
        <LazyLoadDataTable
          data={assetTransactionsAtomValue.transactions}
          columns={transactionsTableColumns}
          nextPage={() => {
            if (assetTransactionsAtomValue.nextPageToken) {
              setNextPageToken(assetTransactionsAtomValue.nextPageToken)
            }
          }}
        />
      )}
    </RenderLoadable>
  )
}

const fetchAssetTransactionResultsAtomBuilder = (assetIndex: AssetIndex, nextPageToken?: string) => {
  return atom(async (_get) => {
    const results = (await indexer
      .searchForTransactions()
      .assetID(assetIndex)
      .nextToken(nextPageToken ?? '')
      .limit(10)
      .do()) as TransactionSearchResults
    return {
      transactionResults: results.transactions,
      nextPageToken: results['next-token'],
    }
  })
}

const getAssetTransactionsAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex, nextPageToken?: string) => {
  const fetchAssetTransactionResultsAtom = fetchAssetTransactionResultsAtomBuilder(assetIndex, nextPageToken)

  return atom(async (get) => {
    // TODO: cache and sync stuff
    const { transactionResults, nextPageToken } = await get(fetchAssetTransactionResultsAtom)
    return {
      transactions: await get(fetchTransactionsAtomBuilder(store, transactionResults)),
      nextPageToken,
    }
  })
}

const useAssetTransactionsAtom = (assetIndex: AssetIndex, nextPageToken?: string) => {
  const store = useStore()

  return useMemo(() => {
    return getAssetTransactionsAtomBuilder(store, assetIndex, nextPageToken)
  }, [store, assetIndex, nextPageToken])
}

export const useLoadableAssetTransactions = (assetIndex: AssetIndex, nextPageToken?: string) => {
  return useAtomValue(loadable(useAssetTransactionsAtom(assetIndex, nextPageToken)))
}

const transactionsTableColumns: ColumnDef<Transaction>[] = [
  {
    header: 'Transaction Id',
    accessorKey: 'id',
    cell: (c) => {
      const value = c.getValue<string>()
      return (
        <div>
          <TransactionLink transactionId={value} short={true} />
        </div>
      )
    },
  },
  {
    accessorKey: 'sender',
    header: 'From',
    cell: (c) => ellipseAddress(c.getValue<string>()),
  },
  {
    header: 'To',
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
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
