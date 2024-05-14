import { Transaction, TransactionType } from '@/features/transactions/models'
import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ColumnDef } from '@tanstack/react-table'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { TransactionLink } from '@/features/transactions/components/transaction-link'

export const assetTransactionsTableColumns: ColumnDef<Transaction>[] = [
  {
    header: 'Transaction Id',
    accessorKey: 'id',
    cell: (c) => {
      const value = c.getValue<string>()
      return <TransactionLink transactionId={value} short={true} />
    },
  },
  {
    header: 'Block Id',
    accessorKey: 'confirmedRound',
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
