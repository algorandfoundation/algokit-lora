import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { ellipseAddress } from '@/utils/ellipse-address'
import { ellipseId } from '@/utils/ellipse-id'
import { TransactionModel } from '@/features/transactions/models'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { TransactionLink } from '@/features/transactions/components/transaction-link'

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
    accessorFn: (transaction) => ('receiver' in transaction ? ellipseAddress(transaction.receiver) : 'N/A'),
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (c) => <DisplayAlgo className={cn('justify-center')} amount={c.getValue<AlgoAmount>()} />,
  },
]

export const transactionsFromLabel = 'From'
export const transactionsToLabel = 'To'
export const transactionsAmountLabel = 'Amount'

export function TransactionsTable({ transactions }: Props) {
  return <DataTable columns={columns} data={transactions} />
}
