import { Group } from '../models'
import { GroupResult } from '../data/types'
import { Transaction } from '@/features/transactions/models'
import { asTransactionsSummary } from '@/features/transactions/mappers'

export const asGroup = (groupResult: GroupResult, transactions: Transaction[]): Group => {
  return {
    id: groupResult.id,
    round: groupResult.round,
    transactions,
    timestamp: groupResult.timestamp,
    transactionsSummary: asTransactionsSummary(transactions),
  }
}
