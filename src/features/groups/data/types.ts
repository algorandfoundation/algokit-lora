import { Round } from '@/features/blocks/data/types'
import { TransactionId } from '@/features/transactions/data/types'

export type GroupId = string

export type GroupResult = {
  round: Round
  id: GroupId
  timestamp: string
  transactionIds: TransactionId[]
}
