import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { Address } from '../data/types'
import { useFetchNextAccountTransactionPage } from '../data/account-transaction-history'
import { useCallback } from 'react'
import { getAccountTransactionsTableSubRows } from '../utils/get-account-transactions-table-sub-rows'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { transactionsTableColumns } from '@/features/transactions/components/transactions-table-columns'

type Props = {
  address: Address
}

export function AccountTransactionHistory({ address }: Props) {
  const fetchNextPage = useFetchNextAccountTransactionPage(address)
  const getSubRows = useCallback((row: Transaction | InnerTransaction) => getAccountTransactionsTableSubRows(address, row), [address])

  return <LazyLoadDataTable columns={transactionsTableColumns} getSubRows={getSubRows} fetchNextPage={fetchNextPage} />
}
