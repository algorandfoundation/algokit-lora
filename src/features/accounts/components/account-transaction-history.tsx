import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { Address } from '../data/types'
import { useFetchNextAccountTransactionPage } from '../data/account-transaction-history'
import { accountTransactionsTableColumns } from './account-transaction-table-columns'

type Props = {
  address: Address
}

export function AccountTransactionHistory({ address }: Props) {
  const fetchNextPage = useFetchNextAccountTransactionPage(address)

  return <LazyLoadDataTable columns={accountTransactionsTableColumns} fetchNextPage={fetchNextPage} />
}
