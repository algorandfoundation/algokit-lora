import { TransactionType } from '@/features/transactions/models'

export type TransactionsSummary = {
  count: number
  countByType: [TransactionType, number][]
}
