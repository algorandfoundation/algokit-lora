import { ApplicationId } from '../data/types'
import { useCallback } from 'react'
import { LiveTransactionsTable } from '@/features/transactions/components/live-transactions-table'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { JotaiStore } from '@/features/common/data/types'
import { createTransactionAtom } from '@/features/transactions/data'
import { atom } from 'jotai'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { applicationTransactionsTableColumns } from '../utils/application-transactions-table-columns'
import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

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
            (txn) => txn['tx-type'] === AlgoSdkTransactionType.appl && txn['application-transaction']?.['application-id'] === applicationId
          )
        ) {
          return []
        }

        const transaction = await get(createTransactionAtom(store, transactionResult))
        return [transaction]
      })
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

  return <LiveTransactionsTable mapper={mapper} getSubRows={getSubRows} columns={applicationTransactionsTableColumns} />
}
