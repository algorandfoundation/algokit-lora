import { JotaiStore } from '@/features/common/data/types'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { createTransactionAtom } from '@/features/transactions/data'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atom } from 'jotai'
import { useCallback } from 'react'
import { Address } from '../data/types'
import { extractTransactionsForAccount } from '../utils/extract-transaction-for-account'
import { accountTransactionsTableColumns } from './account-transaction-table-columns'
import { getAddressesForTransaction } from '../utils/get-account-address-for-transactions'

type Props = {
  address: Address
}

export function AccountLiveTransactions({ address }: Props) {
  const mapper = useCallback(
    (store: JotaiStore, transactionResult: TransactionResult) => {
      return atom(async (get) => {
        const addressesForTransaction = getAddressesForTransaction(transactionResult)
        if (!addressesForTransaction.includes(address)) return []

        const transaction = await get(createTransactionAtom(store, transactionResult))
        return extractTransactionsForAccount(transaction, address)
      })
    },
    [address]
  )
  return <LiveTransactionsTable mapper={mapper} columns={accountTransactionsTableColumns} />
}
