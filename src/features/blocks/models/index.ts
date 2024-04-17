import { TransactionModel, TransactionType } from '@/features/transactions/models'

export type TransactionsSummary = {
  count: number
  countByType: [TransactionType, number][]
}

export type BlockModel = {
  round: number
  previousRound?: number
  nextRound?: number
  timestamp: string
  transactions: TransactionModel[]
  transactionsSummary: TransactionsSummary
}
