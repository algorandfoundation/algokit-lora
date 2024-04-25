import { Group } from '../models'
import { GroupId } from '../data/types'
import { Block } from '@/features/blocks/models'
import { asTransactionsSummary } from '@/features/common/mappers'

export const asGroup = (id: GroupId, block: Block): Group => {
  const transactions = block.transactions.filter((t) => t.group === id)

  return {
    id,
    round: block.round,
    transactions,
    timestamp: block.timestamp,
    transactionsSummary: asTransactionsSummary(transactions),
  }
}
