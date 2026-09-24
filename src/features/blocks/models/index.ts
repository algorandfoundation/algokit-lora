import { Address } from '@/features/accounts/data/types'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
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
  load?: bigint
  congestionTax?: AlgoAmount
}

export type BlockSummary = CommonBlockProperties & {
  transactions: TransactionSummary[]
}
