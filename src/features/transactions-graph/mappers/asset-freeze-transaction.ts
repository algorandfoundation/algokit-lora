import { AssetFreezeTransaction, InnerAssetFreezeTransaction } from '@/features/transactions/models'
import {
  calculateFromNoParent,
  calculateFromWithParent,
  fallbackFromTo,
  TransactionGraphAccountVertical,
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionGraphVisualization,
  TransactionGraphVisualizationType,
} from '@/features/transactions-graph'
import { asTransactionGraphVisualization } from '@/features/transactions-graph/mappers/as-transaction-graph-visualization'

export const getAssetFreezeTransactionVisualizations = (
  transaction: AssetFreezeTransaction | InnerAssetFreezeTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromNoParent(transaction.sender, verticals)
  const accountVertical = verticals.find(
    (c): c is TransactionGraphAccountVertical => c.type === 'Account' && transaction.address === c.accountAddress
  )
  const to = accountVertical
    ? {
        verticalId: accountVertical.id,
        accountNumber: accountVertical.accountNumber,
      }
    : fallbackFromTo

  return [asTransactionGraphVisualization(from, to, { type: TransactionGraphVisualizationType.AssetFreeze })]
}
