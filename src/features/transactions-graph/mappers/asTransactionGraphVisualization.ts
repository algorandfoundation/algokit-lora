import { TransactionGraphVisualization, TransactionVisualisationFromTo } from '@/features/transactions-graph'

export const asTransactionGraphVisualization = (
  from: TransactionVisualisationFromTo,
  to: TransactionVisualisationFromTo,
  overrideDescription?: string
): TransactionGraphVisualization => {
  if (from.verticalId === to.verticalId) {
    return {
      fromVerticalIndex: from.verticalId,
      fromAccountIndex: from.accountNumber,
      type: 'selfLoop' as const,
      overrideDescription: overrideDescription,
    }
  }

  const direction = from.verticalId < to.verticalId ? 'leftToRight' : 'rightToLeft'

  return {
    fromVerticalIndex: Math.min(from.verticalId, to.verticalId),
    fromAccountIndex: from.accountNumber,
    toVerticalIndex: Math.max(from.verticalId, to.verticalId),
    toAccountIndex: to.accountNumber,
    direction: direction,
    type: 'vector' as const,
    overrideDescription: overrideDescription,
  }
}
