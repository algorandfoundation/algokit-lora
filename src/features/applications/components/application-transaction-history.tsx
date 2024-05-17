import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { ApplicationId } from '../data/types'
import { useFetchNextApplicationTransactionsPage } from '../data/application-transaction-history'
import { applicationTransactionsTableColumns } from '../utils/application-transactions-table-columns'
import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { useCallback } from 'react'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationTransactionHistory({ applicationId }: Props) {
  const fetchNextPage = useFetchNextApplicationTransactionsPage(applicationId)
  const getSubRows = useCallback(
    (row: Transaction | InnerTransaction) => {
      if (row.type !== TransactionType.ApplicationCall || row.innerTransactions.length === 0) {
        return []
      }

      return row.innerTransactions.filter((innerTransaction) => {
        const txns = flattenInnerTransactions(innerTransaction)
        return txns.some(({ transaction: txn }) => txn.type === TransactionType.ApplicationCall && txn.applicationId === applicationId)
      })
    },
    [applicationId]
  )

  return <LazyLoadDataTable columns={applicationTransactionsTableColumns} getSubRows={getSubRows} fetchNextPage={fetchNextPage} />
}
