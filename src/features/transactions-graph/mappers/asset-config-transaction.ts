import { AssetConfigTransaction, InnerAssetConfigTransaction } from '@/features/transactions/models'
import {
  calculateFromNoParent,
  calculateFromWithParent,
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionGraphVisualization,
  TransactionGraphVisualizationDescriptionType,
} from '@/features/transactions-graph'
import { asTransactionGraphVisualization } from '@/features/transactions-graph/mappers/as-transaction-graph-visualization'

export const getAssetConfigTransactionVisualizations = (
  transaction: AssetConfigTransaction | InnerAssetConfigTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromNoParent(transaction.sender, verticals)
  const to = {
    verticalId: verticals.find((c) => c.type === 'Asset' && transaction.assetId === c.assetId)?.id ?? -1,
  }

  return [asTransactionGraphVisualization(from, to, { type: TransactionGraphVisualizationDescriptionType.AssetConfig })]
}
