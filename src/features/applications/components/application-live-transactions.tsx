import { ApplicationId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionAtom } from '@/features/transactions/data'
import { atom } from 'jotai'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType } from 'algosdk'
import { extractTransactionsForApplication } from '../utils/extract-transactions-for-application'
import { applicationTransactionsTableColumns } from '../utils/application-transactions-table-columns'

type Props = {
  applicationId: ApplicationId
}

export function ApplicationLiveTransactions({ applicationId }: Props) {
  const mapper = useCallback(
    (store: JotaiStore, transactionResult: TransactionResult) => {
      return atom(async (get) => {
        const transactionResultIncludesInners = flattenTransactionResult(transactionResult)
        if (
          !transactionResultIncludesInners.some(
            (txn) => txn['tx-type'] === TransactionType.appl && txn['application-transaction']?.['application-id'] === applicationId
          )
        ) {
          return []
        }

        const transaction = await get(createTransactionAtom(store, transactionResult))
        return extractTransactionsForApplication(transaction, applicationId)
      })
    },
    [applicationId]
  )
  return <LiveTransactionsTable mapper={mapper} columns={applicationTransactionsTableColumns} />
}
