import { AssetTransferTransaction, AssetTransferTransactionSubType, InnerAssetTransferTransaction } from '@/features/transactions/models'
import {
  calculateFromNoParent,
  calculateFromWithParent,
  fallbackFromTo,
  TransactionGraphAccountVertical,
  TransactionGraphApplicationVertical,
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionGraphVisualization,
} from '@/features/transactions-graph'
import { asTransactionGraphVisualization } from '@/features/transactions-graph/mappers/asTransactionGraphVisualization'
import { Address } from '@/features/accounts/data/types'

export const getAssetTransferTransactionVisualizations = (
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  if (transaction.subType === AssetTransferTransactionSubType.Clawback) {
    return [
      foo(transaction.sender, transaction.clawbackFrom!, verticals, parent, 'Clawback'),
      foo(transaction.clawbackFrom!, transaction.receiver, verticals, parent),
    ]
  }

  return [foo(transaction.sender, transaction.receiver, verticals, parent)]
}

const foo = (
  sender: Address,
  receiver: Address,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal,
  overrideDescription?: string
): TransactionGraphVisualization => {
  const from = parent ? calculateFromWithParent(sender, verticals, parent) : calculateFromNoParent(sender, verticals)

  const toAccountVertical = verticals.find(
    (c): c is TransactionGraphAccountVertical => c.type === 'Account' && c.accountAddress === receiver
  )
  const toApplicationVertical = verticals.find(
    (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && c.linkedAccount.accountAddress === receiver
  )
  let to = fallbackFromTo
  if (toAccountVertical) {
    to = {
      verticalId: toAccountVertical.id,
      accountNumber: toAccountVertical.accountNumber,
    }
  }
  if (toApplicationVertical) {
    to = {
      verticalId: toApplicationVertical.id,
      accountNumber: toApplicationVertical.linkedAccount.accountNumber,
    }
  }

  return asTransactionGraphVisualization(from, to, overrideDescription)
}
