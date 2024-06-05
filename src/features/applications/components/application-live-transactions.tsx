import { ApplicationId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { Transaction, InnerTransaction } from '@/features/transactions/models'
import { getApplicationTransactionsTableSubRows } from '../utils/get-application-transactions-table-sub-rows'
import { transactionsTableColumns } from '@/features/transactions/components/transactions-table-columns'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationLiveTransactions({ applicationId }: Props) {
  const filter = useCallback(
    (transactionResult: TransactionResult) => {
      const flattenedTransactionResults = flattenTransactionResult(transactionResult)
      return flattenedTransactionResults.some(
        (txn) => txn['tx-type'] === AlgoSdkTransactionType.appl && txn['application-transaction']?.['application-id'] === applicationId
      )
    },
    [applicationId]
  )

  const getSubRows = useCallback(
    (row: Transaction | InnerTransaction) => getApplicationTransactionsTableSubRows(applicationId, row),
    [applicationId]
  )

  return <LiveTransactionsTable filter={filter} getSubRows={getSubRows} columns={transactionsTableColumns} />
}
