import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { ApplicationId } from '../data/types'
import { useFetchNextApplicationTransactionsPage } from '../data/application-transaction-history'
import { applicationTransactionsTableColumns } from '../utils/application-transactions-table-columns'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { useCallback } from 'react'
import { getApplicationTransactionsTableSubRows } from '../utils/get-application-transactions-table-sub-rows'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationTransactionHistory({ applicationId }: Props) {
  // TODO: for the future
  // How we handle getSubRows isn't the best practice. Ideally, we should create a new view model, for example, TransactionForApplication
  // and then fetchNextPage should return a list of TransactionForApplication
  // TransactionForApplication should be similar to Transaction, but the InnerTransactions should be only transactions that are related to the application
  // This way, getSubRows simply return the innerTransactions
  const fetchNextPage = useFetchNextApplicationTransactionsPage(applicationId)
  const getSubRows = useCallback(
    (row: Transaction | InnerTransaction) => getApplicationTransactionsTableSubRows(applicationId, row),
    [applicationId]
  )

  return <LazyLoadDataTable columns={applicationTransactionsTableColumns} getSubRows={getSubRows} fetchNextPage={fetchNextPage} />
}
