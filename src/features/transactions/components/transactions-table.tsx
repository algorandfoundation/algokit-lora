import { InnerTransaction, Transaction, TransactionType } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { ColumnDef } from '@tanstack/react-table'

type Props = {
  transactions: Transaction[] | InnerTransaction[]
  columns: ColumnDef<Transaction | InnerTransaction>[]
  subRowsExpanded?: boolean
}

const getSubRows = (transaction: Transaction | InnerTransaction) => {
  if (transaction.type !== TransactionType.AppCall || transaction.innerTransactions.length === 0) {
    return []
  }
  return transaction.innerTransactions
}

export function TransactionsTable({ transactions, columns, subRowsExpanded }: Props) {
  return <DataTable columns={columns} data={transactions} getSubRows={getSubRows} subRowsExpanded={subRowsExpanded} />
}
