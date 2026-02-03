import { TransactionType } from '@/features/transactions/models'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/amount'

export type TransactionsSummary = {
  count: number
  countByType: [TransactionType, number][]
  feeTotal: AlgoAmount
}
