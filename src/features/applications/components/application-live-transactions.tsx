import { ApplicationId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { applicationTransactionsTableColumns } from '../utils/application-transactions-table-columns'
import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

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
    (row: Transaction | InnerTransaction) => {
      if (row.type !== TransactionType.ApplicationCall || row.innerTransactions.length === 0) {
        return []
      }

      return row.innerTransactions.filter((innerTransaction) => {
        const txns = flattenInnerTransactions(innerTransaction)
        return txns.some(({ transaction: txn }) => txn.type === TransactionType.ApplicationCall && txn.applicationId === applicationId)
      })
    },
    [applicationId]
  )

  return <LiveTransactionsTable filter={filter} getSubRows={getSubRows} columns={applicationTransactionsTableColumns} />
}
