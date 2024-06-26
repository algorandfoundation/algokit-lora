import { TransactionGraphVertical, TransactionsGraphData } from '@/features/transactions-graph'
import { Transaction } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { getVerticalsForTransactions } from '@/features/transactions-graph/mappers/verticals'
import { getHorizontalsForTransaction } from '@/features/transactions-graph/mappers/horizontals'

export const asTransactionsGraphData = (transactions: Transaction[]): TransactionsGraphData => {
  const flattenedTransactions = transactions.flatMap((transaction) => flattenInnerTransactions(transaction))
  const verticals: TransactionGraphVertical[] = [
    ...getVerticalsForTransactions(flattenedTransactions.map((t) => t.transaction)),
    {
      id: -1,
      type: 'Placeholder',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  const horizontals = transactions.flatMap((txn) => getHorizontalsForTransaction(txn, verticals, [], false, 0))

  return {
    horizontals: horizontals,
    verticals: verticals,
  }
}
