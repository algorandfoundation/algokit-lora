import { TransactionResult } from '@/features/transactions/data/types'
import { groupResultBuilder } from '../builders/group-result-builder'

export const groupResultMother = {
  groupWithTransactions: (transactions: TransactionResult[]) => {
    return groupResultBuilder().withTransactionIds(transactions.map((t) => t.id!))
  },
}
