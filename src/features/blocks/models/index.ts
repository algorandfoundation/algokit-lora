import { Transaction, TransactionSummary, TransactionType } from '@/features/transactions/models'

export type TransactionsSummary = {
  count: number
  countByType: [TransactionType, number][]
}

export type CommonBlockProperties = {
  round: number
  timestamp: string
  transactionsSummary: TransactionsSummary
}

export type Block = CommonBlockProperties & {
  previousRound?: number
  nextRound?: number
  transactions: Transaction[]
}

export type BlockSummary = CommonBlockProperties & {
  transactions: TransactionSummary[]
}
