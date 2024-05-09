import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { AssetIndex } from '../data/types'
import { indexer } from '@/features/common/data'
import { TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
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
import { atomEffect } from 'jotai-effect'

type Props = {
  assetIndex: AssetIndex
}

export function AssetTransactionHistory({ assetIndex }: Props) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const loadableTransactions = useLoadableAssetTransactions(assetIndex, currentPage)

  // TODO: only allow next if the next page token is available
  return (
    <RenderLoadable loadable={loadableTransactions}>
      {(assetTransactionsAtomValue) => (
        <LazyLoadDataTable
          data={assetTransactionsAtomValue.transactions}
          columns={transactionsTableColumns}
          nextPageEnabled={assetTransactionsAtomValue.nextPageToken !== undefined}
          nextPage={() => {
            setCurrentPage((prev) => prev + 1)
          }}
          currentPage={currentPage}
          previousPageEnabled={currentPage > 1}
          previousPage={() => {
            setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
          }}
        />
      )}
    </RenderLoadable>
  )
}

const fetchAssetTransactionResults = async (assetIndex: AssetIndex, nextPageToken?: string) => {
  const results = (await indexer
    .searchForTransactions()
    .assetID(assetIndex)
    .nextToken(nextPageToken ?? '')
    .limit(10)
    .do()) as TransactionSearchResults
  return {
    transactionResults: results.transactions,
    nextPageToken: results['next-token'],
  } as const
}

const getSyncEffect = ({ transactionResults, nextPageToken }: { transactionResults: TransactionResult[]; nextPageToken?: string }) => {
  return atomEffect((_, set) => {
    ;(async () => {
      try {
        set(assetTransactionResultsPagesAtom, (prev) => {
          return Array.from(prev).concat([{ transactionResults, nextPageToken }])
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })
}

const getAssetTransactionsAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex, pageNumber: number) => {
  return atom(async (get) => {
    const index = pageNumber - 1
    const cache = store.get(assetTransactionResultsPagesAtom)

    if (index < cache.length) {
      const page = cache[index]
      return {
        transactions: await get(fetchTransactionsAtomBuilder(store, page.transactionResults)),
        nextPageToken: page.nextPageToken,
      }
    }

    const foo = cache[cache.length - 1]?.nextPageToken
    const { transactionResults, nextPageToken } = await fetchAssetTransactionResults(assetIndex, foo)

    get(getSyncEffect({ transactionResults, nextPageToken }))

    return {
      transactions: await get(fetchTransactionsAtomBuilder(store, transactionResults)),
      nextPageToken,
    }
  })
}

const useAssetTransactionsAtom = (assetIndex: AssetIndex, pageNumber: number) => {
  const store = useStore()

  return useMemo(() => {
    return getAssetTransactionsAtomBuilder(store, assetIndex, pageNumber)
  }, [store, assetIndex, pageNumber])
}

export const useLoadableAssetTransactions = (assetIndex: AssetIndex, pageNumber: number) => {
  return useAtomValue(loadable(useAssetTransactionsAtom(assetIndex, pageNumber)))
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

// TODO: need to reset this atom
const assetTransactionResultsPagesAtom = atom<AssetTransactionResultsPage[]>([])

type AssetTransactionResultsPage = {
  transactionResults: TransactionResult[]
  nextPageToken?: string
}
