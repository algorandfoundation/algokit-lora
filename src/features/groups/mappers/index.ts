import { Group } from '../models'
import { GroupResult } from '../data/types'
import { asTransactionsSummary } from '@/features/common/mappers'
import { Transaction } from '@/features/transactions/models'

export const asGroup = (groupResult: GroupResult, transactions: Transaction[]): Group => {
  return {
    id: groupResult.id,
    round: groupResult.round,
    transactions,
    timestamp: groupResult.timestamp,
    transactionsSummary: asTransactionsSummary(transactions),
  }
}
