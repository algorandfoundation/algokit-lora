import { StateProofTransaction } from '@/features/transactions/models'
import {
  calculateFromNoParent,
  TransactionGraphVertical,
  TransactionGraphVisualization,
  TransactionGraphVisualizationType,
  TransactionGraphVisualizationDescriptionType,
} from '@/features/transactions-graph'

export const getStateProofTransactionVisualizations = (
  transaction: StateProofTransaction,
  verticals: TransactionGraphVertical[]
): TransactionGraphVisualization[] => {
  const from = calculateFromNoParent(transaction.sender, verticals)

  return [
    {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      shape: TransactionGraphVisualizationType.Point,
      description: {
        type: TransactionGraphVisualizationDescriptionType.StateProof,
      },
    },
  ]
}
