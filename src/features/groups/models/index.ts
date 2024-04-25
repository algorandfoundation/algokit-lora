import { Transaction } from '@/features/transactions/models'
import { GroupId } from '../data/types'
import { Round } from '@/features/blocks/data/types'
import { TransactionsSummary } from '@/features/common/models'

export type Group = {
  id: GroupId
  round: Round
  transactions: Transaction[]
  timestamp: string
  transactionsSummary: TransactionsSummary
}
