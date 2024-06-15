import { Group } from '../models'
import { GroupResult } from '../data/types'
import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { asTransactionsSummary } from '@/features/transactions/mappers'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

export const asGroup = (groupResult: GroupResult, transactions: Transaction[]): Group => {
  // The transactions passed in are always parent transactions.
  // The group can be an inner transaction group, so we want to filter any transactions that aren't related to the group.
  const transactionsInGroup = transactions.reduce(
    (acc, txn) => {
      if (txn.group === groupResult.id) {
        // transaction in the group is at the root level, no need to search further
        acc.push(txn)
      } else if (txn.type === TransactionType.AppCall && txn.innerTransactions.length > 0) {
        const txns = flattenInnerTransactions(txn)
        txns.forEach((flat) => {
          if (flat.transaction.group === groupResult.id) {
            acc.push(flat.transaction)
          }
        })
      }
      return acc
    },
    [] as (Transaction | InnerTransaction)[]
  )

  return {
    id: groupResult.id,
    round: groupResult.round,
    transactions: transactionsInGroup,
    timestamp: groupResult.timestamp,
    transactionsSummary: asTransactionsSummary(transactionsInGroup),
  }
}
