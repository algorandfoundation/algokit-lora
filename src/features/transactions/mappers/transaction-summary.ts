import { TransactionsSummary } from '@/features/common/models'
import { Transaction, TransactionType } from '@/features/transactions/models'
import { microAlgos } from '@algorandfoundation/algokit-utils'

export const asTransactionsSummary = (transactions: Pick<Transaction, 'type' | 'fee'>[]): TransactionsSummary => {
  const [countByType, feeTotal] = transactions.reduce(
    (acc, transaction) => {
      const count = (acc[0].get(transaction.type) || 0) + 1
      const feeTotal = acc[1] + transaction.fee.microAlgos
      return [acc[0].set(transaction.type, count), feeTotal]
    },
    [new Map<TransactionType, number>(), 0 as number] as const
  )

  return {
    count: transactions.length,
    countByType: Array.from(countByType.entries()),
    feeTotal: microAlgos(feeTotal),
  }
}
