import { TransactionType } from '@/features/transactions/models'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

export type TransactionsSummary = {
  count: number
  countByType: [TransactionType, number][]
  feeTotal: AlgoAmount
}
