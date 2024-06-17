import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { ApplicationId } from '../data/types'
import { createLoadableApplicationTransactionsPage } from '../data/application-transaction-history'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { useCallback, useMemo } from 'react'
import { getApplicationTransactionsTableSubRows } from '../utils/get-application-transactions-table-sub-rows'
import { transactionsTableColumns } from '@/features/transactions/components/transactions-table-columns'
import { ListingOrderLabel } from '@/features/common/components/listing-order-label'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationTransactionHistory({ applicationId }: Props) {
  const createLoadablePage = useMemo(() => createLoadableApplicationTransactionsPage(applicationId), [applicationId])

  // TODO: for the future
  // How we handle getSubRows isn't the best practice. Ideally, we should create a new view model, for example, TransactionForApplication
  // and then fetchNextPage should return a list of TransactionForApplication
  // TransactionForApplication should be similar to Transaction, but the InnerTransactions should be only transactions that are related to the application
  // This way, getSubRows simply return the innerTransactions
  const getSubRows = useCallback(
    (row: Transaction | InnerTransaction) => getApplicationTransactionsTableSubRows(applicationId, row),
    [applicationId]
  )

  return (
    <div>
      <LazyLoadDataTable columns={transactionsTableColumns} getSubRows={getSubRows} createLoadablePage={createLoadablePage} />
      <ListingOrderLabel />
    </div>
  )
}
