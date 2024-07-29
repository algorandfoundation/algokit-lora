import { Vertical, TransactionsGraphData } from '../models'
import { Transaction } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { getVerticalsForTransactions } from './verticals'
import { getHorizontalsForTransaction } from './horizontals'

export const asTransactionsGraphData = (transactions: Transaction[]): TransactionsGraphData => {
  const flattenedTransactions = transactions.flatMap((transaction) => flattenInnerTransactions(transaction))
  const verticals: Vertical[] = [...getVerticalsForTransactions(flattenedTransactions.map((t) => t.transaction))]
  const horizontals = transactions.flatMap((txn) => getHorizontalsForTransaction(txn, verticals, [], false, 0))

  if (horizontals.some((h) => h.representation.type === 'SelfLoop' && h.representation.fromVerticalIndex === verticals.length - 1)) {
    // If there is a self-loop at the end of the graph, we need to add a placeholder vertical
    verticals.push({
      id: -1,
      type: 'Placeholder',
    })
  }

  return {
    horizontals: horizontals,
    verticals: verticals,
  }
}
