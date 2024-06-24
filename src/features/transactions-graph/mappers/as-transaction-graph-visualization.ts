import {
  TransactionGraphVisualization,
  TransactionGraphVisualizationDescription,
  TransactionGraphVisualizationShape,
  TransactionVisualisationFromTo,
} from '@/features/transactions-graph'

export const asTransactionGraphVisualization = (
  from: TransactionVisualisationFromTo,
  to: TransactionVisualisationFromTo,
  description: TransactionGraphVisualizationDescription
): TransactionGraphVisualization => {
  if (from.verticalId === to.verticalId) {
    return {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      shape: TransactionGraphVisualizationShape.SelfLoop,
      description,
    }
  }

  const direction = from.verticalId < to.verticalId ? 'leftToRight' : 'rightToLeft'

  return {
    fromVerticalIndex: Math.min(from.verticalId, to.verticalId),
    fromAccountIndex: from.accountNumber,
    toVerticalIndex: Math.max(from.verticalId, to.verticalId),
    toAccountIndex: to.accountNumber,
    direction: direction,
    shape: TransactionGraphVisualizationShape.Vector,
    description,
  }
}
