import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { ApplicationId } from '../data/types'
import { useFetchNextApplicationTransactionsPage } from '../data/application-transaction-history'
import { applicationTransactionsTableColumns } from '../utils/application-transactions-table-columns'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationTransactionHistory({ applicationId }: Props) {
  const fetchNextPage = useFetchNextApplicationTransactionsPage(applicationId)

  return <LazyLoadDataTable columns={applicationTransactionsTableColumns} fetchNextPage={fetchNextPage} />
}
