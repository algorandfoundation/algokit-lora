import { ApplicationId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { Transaction, InnerTransaction } from '@/features/transactions/models'
import { getApplicationTransactionsTableSubRows } from '../utils/get-application-transactions-table-sub-rows'
import { transactionsTableColumns } from '@/features/transactions/components/transactions-table-columns'
import { TransactionResult } from '@/features/transactions/data/types'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationLiveTransactions({ applicationId }: Props) {
  const filter = useCallback(
    (transactionResult: TransactionResult) => {
      const flattenedTransactionResults = flattenTransactionResult(transactionResult)
      return flattenedTransactionResults.some(
        (txn) => txn.txType === TransactionType.AppCall && txn.applicationTransaction?.applicationId === applicationId
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
