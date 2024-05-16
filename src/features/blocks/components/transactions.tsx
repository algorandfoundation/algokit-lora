import { DisplayAlgo } from '@/features/common/components/display-algo'
import { ellipseAddress } from '@/utils/ellipse-address'
import { Transaction, TransactionType } from '@/features/transactions/models'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { DisplayAssetAmount } from '@/features/common/components/display-asset-amount'
import { GroupLink } from '@/features/groups/components/group-link'
import { asTo } from '@/features/common/mappers/to'

type Props = {
  transactions: Transaction[]
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'Transaction ID',
    cell: (c) => <TransactionLink transactionId={c.getValue<string>()} short={true} />,
  },
  {
    header: 'Group ID',
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const transaction = c.getValue<Transaction>()
      return transaction.group ? <GroupLink round={transaction.confirmedRound} groupId={transaction.group} short={true} /> : undefined
    },
  },
  {
    header: 'From',
    accessorFn: (transaction) => ellipseAddress(transaction.sender),
  },
  {
    header: 'To',
    accessorFn: asTo,
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    header: 'Amount',
    accessorFn: (transaction) => transaction,
    cell: (c) => {
      const value = c.getValue<Transaction>()
      if (value.type === TransactionType.Payment) {
        return <DisplayAlgo amount={value.amount} />
      }
      if (value.type === TransactionType.AssetTransfer) {
        return <DisplayAssetAmount amount={value.amount} asset={value.asset} />
      }
      return undefined
    },
  },
]

export const transactionsFromLabel = 'From'
export const transactionsToLabel = 'To'
export const transactionsAmountLabel = 'Amount'

export function TransactionsTable({ transactions }: Props) {
  return <DataTable columns={columns} data={transactions} />
}
