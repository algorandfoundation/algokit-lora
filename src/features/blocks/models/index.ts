import { AsyncMaybeAtom } from '@/features/common/data/types'
import { TransactionsSummary } from '@/features/common/models'
import { Transaction, TransactionSummary } from '@/features/transactions/models'

export type CommonBlockProperties = {
  round: number
  timestamp: string
  transactionsSummary: TransactionsSummary
}

export type Block = CommonBlockProperties & {
  previousRound?: number
  nextRound: AsyncMaybeAtom<number>
  transactions: Transaction[]
  json: string
}

export type BlockSummary = CommonBlockProperties & {
  transactions: TransactionSummary[]
}
