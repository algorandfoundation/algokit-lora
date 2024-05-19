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
  const fetchNextPage = useFetchNextApplicationTransactionsPage(applicationId)
  const getSubRows = useCallback(
    (row: Transaction | InnerTransaction) => getApplicationTransactionsTableSubRows(applicationId, row),
    [applicationId]
  )

  return <LazyLoadDataTable columns={applicationTransactionsTableColumns} getSubRows={getSubRows} fetchNextPage={fetchNextPage} />
}
