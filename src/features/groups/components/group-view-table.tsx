import { useMemo } from 'react'
import { Group } from '../models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { DataTable } from '@/features/common/components/data-table'
import { transactionsTableColumns } from '@/features/transactions/components/transaction-view-table'

type Props = {
  group: Group
}

export function GroupViewTable({ group }: Props) {
  const flattenedTransactions = useMemo(
    () => group.transactions.flatMap((transaction) => flattenInnerTransactions(transaction)),
    [group.transactions]
  )

  return <DataTable columns={transactionsTableColumns} data={flattenedTransactions} />
}
