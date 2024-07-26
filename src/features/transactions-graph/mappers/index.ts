import { TransactionsGraphData, Vertical } from '../models'
import { Transaction } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { getVerticalsForTransactions } from './verticals'
import { getHorizontalsForTransaction } from './horizontals'
import { useMemo } from 'react'
import { atom, useAtomValue } from 'jotai'
import { applicationArc32AppSpec } from '@/features/applications/data/application-metadata'

const createTransactionsGraphDataAtom = (transactions: Transaction[]) => {
  return atom((get) => {
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
      appSpecs: get(applicationArc32AppSpec),
    } satisfies TransactionsGraphData
  })
}

export const useTransactionsGraphData = (transactions: Transaction[]) => {
  const atom = useMemo(() => createTransactionsGraphDataAtom(transactions), [transactions])
  return useAtomValue(atom)
}
