import { Round } from '@/features/blocks/data/types'
import { TransactionId } from '@/features/transactions/data/types'

export type GroupId = string

export type GroupResult = {
  id: GroupId
  timestamp: string
  round: Round
  transactionIds: TransactionId[]
}
