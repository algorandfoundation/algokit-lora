import { Address } from '../data/types'
import { Transaction, TransactionType } from '@/features/transactions/models'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { cn } from '@/features/common/utils'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ColumnDef } from '@tanstack/react-table'
import { useFetchNextAccountTransactionPage } from '../data/account-transaction-history'
import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'

type Props = {
  address: Address
}

export function AccountTransactionHistory({ address }: Props) {
  const fetchNextPage = useFetchNextAccountTransactionPage(address)

  return <LazyLoadDataTable columns={transactionsTableColumns} fetchNextPage={fetchNextPage} />
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
