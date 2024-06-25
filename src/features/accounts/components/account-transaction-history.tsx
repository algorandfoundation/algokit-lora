import { LazyLoadDataTable } from '@/features/common/components/lazy-load-data-table'
import { Address } from '../data/types'
import { createLoadableAccountTransactionsPage } from '../data/account-transaction-history'
import { useCallback, useMemo } from 'react'
import { getAccountTransactionsTableSubRows } from '../utils/get-account-transactions-table-sub-rows'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { transactionsTableColumns } from '@/features/transactions/components/transactions-table-columns'
import { ListingOrderLabel } from '@/features/common/components/listing-order-label'

type Props = {
  address: Address
}

export function AccountTransactionHistory({ address }: Props) {
  const createLoadablePage = useMemo(() => createLoadableAccountTransactionsPage(address), [address])
  const getSubRows = useCallback((row: Transaction | InnerTransaction) => getAccountTransactionsTableSubRows(address, row), [address])

  return (
    <div>
      <LazyLoadDataTable columns={transactionsTableColumns} getSubRows={getSubRows} createLoadablePage={createLoadablePage} />
      <ListingOrderLabel oldestToNewest={false} />
    </div>
  )
}
