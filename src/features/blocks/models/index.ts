import { TransactionsSummary } from '@/features/common/models'
import { Transaction, TransactionSummary } from '@/features/transactions/models'
import { Atom } from 'jotai'

export type CommonBlockProperties = {
  round: number
  timestamp: string
  transactionsSummary: TransactionsSummary
}

export type Block = CommonBlockProperties & {
  previousRound?: number
  nextRound: Atom<Promise<number> | number>
  transactions: Transaction[]
  json: string
}

export type BlockSummary = CommonBlockProperties & {
  transactions: TransactionSummary[]
}
