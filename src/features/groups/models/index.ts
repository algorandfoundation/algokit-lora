import { Transaction } from '@/features/transactions/models'
import { GroupId } from '../data/types'

export type Group = {
  id: GroupId
  transactions: Transaction[]
  timestamp: number
}
