import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { ApplicationId } from '../data/types'

export const getApplicationTransactionsTableSubRows = (applicationId: ApplicationId, transaction: Transaction | InnerTransaction) => {
  if (transaction.type !== TransactionType.AppCall || transaction.innerTransactions.length === 0) {
    return []
  }

  return transaction.innerTransactions.filter((innerTransaction) => {
    const txns = flattenInnerTransactions(innerTransaction)
    return txns.some(({ transaction: txn }) => txn.type === TransactionType.AppCall && txn.applicationId === applicationId)
  })
}
