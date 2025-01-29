import { Address } from '@/features/accounts/data/types'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { TransactionsSummary } from '@/features/common/models'
import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Round } from '../data/types'

export type CommonBlockProperties = {
  round: Round
  timestamp: string
  transactionsSummary: TransactionsSummary
}

export type Block = CommonBlockProperties & {
  previousRound?: Round
  nextRound: AsyncMaybeAtom<Round>
  transactions: Transaction[]
  json: string
  proposer?: Address
}

export type BlockSummary = CommonBlockProperties & {
  transactions: TransactionSummary[]
}
