import { InnerKeyRegTransaction, KeyRegTransaction } from '@/features/transactions/models'
import {
  calculateFromNoParent,
  calculateFromWithParent,
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionGraphVisualization,
  TransactionGraphVisualizationType,
  TransactionGraphVisualizationDescriptionType,
} from '@/features/transactions-graph'

export const getKeyRegTransactionVisualizations = (
  transaction: KeyRegTransaction | InnerKeyRegTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromNoParent(transaction.sender, verticals)

  return [
    {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      shape: TransactionGraphVisualizationType.Point,
      description: {
        type: TransactionGraphVisualizationDescriptionType.KeyReg,
      },
    },
  ]
}
