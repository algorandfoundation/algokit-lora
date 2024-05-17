import { Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { ApplicationId } from '../data/types'

export const extractTransactionsForApplication = (transaction: Transaction, applicationId: ApplicationId) => {
  const flattenedTransactions = flattenInnerTransactions(transaction)
  return flattenedTransactions
    .map((e) => e.transaction)
    .filter((transaction) => transaction.type === TransactionType.ApplicationCall && transaction.applicationId === applicationId)
}
