import { Vertical, TransactionsGraphData } from '../models'
import { Transaction } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { getVerticalsForTransactions } from './verticals'
import { getHorizontalsForTransaction } from './horizontals'

const base64Symbols = /[+=/]/g

export const asTransactionsGraphData = (transactions: Transaction[]): TransactionsGraphData => {
  const flattenedTransactions = transactions.flatMap((transaction) => flattenInnerTransactions(transaction))
  const verticals: Vertical[] = [...getVerticalsForTransactions(flattenedTransactions.map((t) => t.transaction))]
  const horizontals = transactions.flatMap((txn) => getHorizontalsForTransaction(txn, verticals, [], false, 0))

  const firstTransaction = transactions.length > 0 ? transactions[0] : undefined
  const filename = firstTransaction
    ? firstTransaction.group
      ? `block-${firstTransaction.confirmedRound}-group-${firstTransaction.group.replace(base64Symbols, '_')}.png`
      : `transaction-${firstTransaction.id}.png`
    : 'transactions-graph.png'

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
    filename: filename,
  }
}
