import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { useCallback } from 'react'
import { Address } from '../data/types'
import { getAddressesForTransaction } from '../utils/get-account-address-for-transactions'
import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { getAccountTransactionsTableSubRows } from '../utils/get-account-transactions-table-sub-rows'
import { transactionsTableColumns } from '@/features/transactions/components/transactions-table-columns'

type Props = {
  address: Address
}

export function AccountLiveTransactions({ address }: Props) {
  const filter = useCallback(
    (transactionResult: TransactionResult) => {
      const addressesForTransaction = getAddressesForTransaction(transactionResult)
      return addressesForTransaction.includes(address)
    },
    [address]
  )

  const getSubRows = useCallback((row: Transaction | InnerTransaction) => getAccountTransactionsTableSubRows(address, row), [address])
  return <LiveTransactionsTable filter={filter} getSubRows={getSubRows} columns={transactionsTableColumns} />
}
