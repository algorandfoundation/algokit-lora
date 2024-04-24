import { DisplayAlgo } from '@/features/common/components/display-algo'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ellipseId } from '@/utils/ellipse-id'
import { TransactionModel, TransactionType } from '@/features/transactions/models'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'

type Props = {
  transactions: TransactionModel[]
}

export const columns: ColumnDef<TransactionModel>[] = [
  {
    accessorKey: 'id',
    header: 'Transaction ID',
    cell: (c) => <TransactionLink transactionId={c.getValue<string>()} short={true} />,
  },
  {
    header: 'Group ID',
    accessorFn: (transaction) => ellipseId(transaction.group),
  },
  {
    header: 'From',
    accessorFn: (transaction) => ellipseAddress(transaction.sender),
  },
  {
    header: 'To',
    accessorFn: (transaction) => {
      if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer)
        return ellipseAddress(transaction.receiver)
      if (transaction.type === TransactionType.ApplicationCall) return transaction.applicationId
      if (transaction.type === TransactionType.AssetConfig) return transaction.assetId
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
      const value = c.getValue<TransactionModel>()
      if (value.type === TransactionType.Payment) {
        return <DisplayAlgo amount={value.amount} />
      }
      if (value.type === TransactionType.AssetTransfer) {
        return <DisplayAssetAmount amount={value.amount} asset={value.asset} />
      }
      return <></>
    },
  },
]

export const transactionsFromLabel = 'From'
export const transactionsToLabel = 'To'
export const transactionsAmountLabel = 'Amount'

export function TransactionsTable({ transactions }: Props) {
  return <DataTable columns={columns} data={transactions} />
}
