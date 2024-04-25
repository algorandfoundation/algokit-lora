import { Transaction } from '@/features/transactions/models'
import { Group } from '../models'
import { GroupId } from '../data/types'

export const asGroup = (id: GroupId, transactions: Transaction[]): Group => {
  return {
    id,
    transactions,
    timestamp: Date.now(), // TODO: fix this
  }
}
