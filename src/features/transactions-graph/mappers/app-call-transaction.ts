import { AppCallTransaction, AppCallTransactionSubType, InnerAppCallTransaction } from '@/features/transactions/models'
import {
  calculateFromNoParent,
  calculateFromWithParent,
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionGraphVisualization,
} from '@/features/transactions-graph'
import { asTransactionGraphVisualization } from '@/features/transactions-graph/mappers/asTransactionGraphVisualization'

export const getAppCallTransactionVisualizations = (
  transaction: AppCallTransaction | InnerAppCallTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const from = parent
    ? calculateFromWithParent(transaction.sender, verticals, parent)
    : calculateFromNoParent(transaction.sender, verticals)
  const to =
    transaction.subType === AppCallTransactionSubType.OpUp
      ? {
          verticalId: verticals.find((c) => c.type === 'OpUp')?.id ?? -1,
        }
      : {
          verticalId: verticals.find((c) => c.type === 'Application' && transaction.applicationId === c.applicationId)?.id ?? -1,
        }

  return [asTransactionGraphVisualization(from, to)]
}
