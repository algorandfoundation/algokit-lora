import { TransactionResult } from '@/features/transactions/data/types'
import { blockResultBuilder } from '../builders/block-result-builder'

export const blockResultMother = {
  blockWithTransactions: (transactions: TransactionResult[]) => {
    return blockResultBuilder().withTransactionIds(transactions.map((t) => t.id))
  },
  blockWithoutTransactions: () => {
    return blockResultBuilder().withTransactionIds([])
  },
}
