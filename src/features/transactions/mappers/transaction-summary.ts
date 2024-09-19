import { TransactionsSummary } from '@/features/common/models'
import { Transaction, TransactionType } from '@/features/transactions/models'
import { microAlgos } from '@algorandfoundation/algokit-utils'

type TransactionsSummaryInput = Pick<Transaction, 'type' | 'fee'> & {
  innerTransactions?: TransactionsSummaryInput[]
}

// This function recursively reduces all inner transactions
const reduceAllTransactions = (
  acc: [Map<TransactionType, number>, number, number],
  transaction: TransactionsSummaryInput
): [Map<TransactionType, number>, number, number] => {
  acc[0].set(transaction.type, (acc[0].get(transaction.type) ?? 0) + 1) // countByType accumulation
  acc[1] = acc[1] + Number(transaction.fee.microAlgos) // feeTotal accumulation
  acc[2] = acc[2] + 1 // transactionCount accumulation
  return (transaction.innerTransactions ?? []).reduce(reduceAllTransactions, acc)
}

export const asTransactionsSummary = (transactions: TransactionsSummaryInput[]): TransactionsSummary => {
  const [countByType, feeTotal, transactionCount] = transactions.reduce(reduceAllTransactions, [
    new Map<TransactionType, number>(),
    0 as number,
    0 as number,
  ] as const)

  return {
    count: transactionCount,
    countByType: Array.from(countByType.entries()),
    feeTotal: microAlgos(feeTotal),
  }
}
