import { TransactionsSummary } from '@/features/common/models'
import { Transaction, TransactionSummary } from '@/features/transactions/models'

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
