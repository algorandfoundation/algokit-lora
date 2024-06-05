import { InnerTransaction, Transaction, TransactionType } from '../models'
import { DataTable } from '@/features/common/components/data-table'
import { transactionsTableColumns } from './transactions-table-columns'
import { ColumnDef } from '@tanstack/react-table'

type Props = {
  transactions: Transaction[] | InnerTransaction[]
  columns?: ColumnDef<Transaction | InnerTransaction>[]
  subRowsExpanded?: boolean
}

const getSubRows = (transaction: Transaction | InnerTransaction) => {
  if (transaction.type !== TransactionType.ApplicationCall || transaction.innerTransactions.length === 0) {
    return []
  }
  return transaction.innerTransactions
}

export function TransactionsTable({ transactions, columns: _columns, subRowsExpanded }: Props) {
  const columns = _columns || transactionsTableColumns
  return <DataTable columns={columns} data={transactions} getSubRows={getSubRows} subRowsExpanded={subRowsExpanded} />
}
