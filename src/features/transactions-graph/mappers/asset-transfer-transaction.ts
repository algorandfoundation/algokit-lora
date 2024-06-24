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
  TransactionGraphVisualizationDescription,
  TransactionGraphVisualizationDescriptionType,
} from '@/features/transactions-graph'
import { asTransactionGraphVisualization } from '@/features/transactions-graph/mappers/as-transaction-graph-visualization'
import { Address } from '@/features/accounts/data/types'
import { isDefined } from '@/utils/is-defined'

export const getAssetTransferTransactionVisualizations = (
  transaction: AssetTransferTransaction | InnerAssetTransferTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  let closeOut: TransactionGraphVisualization | undefined = undefined
  if (transaction.closeRemainder) {
    closeOut = foo({
      sender: transaction.sender,
      receiver: transaction.closeRemainder.to,
      verticals,
      parent,
      description: {
        type: TransactionGraphVisualizationDescriptionType.AssetCloseOut,
        amount: transaction.closeRemainder.amount,
        asset: transaction.asset,
      },
    })
  }

  if (transaction.subType === AssetTransferTransactionSubType.Clawback) {
    return [
      foo({
        sender: transaction.sender,
        receiver: transaction.clawbackFrom!,
        verticals,
        parent,
        description: {
          type: TransactionGraphVisualizationDescriptionType.Clawback,
        },
      }),
      foo({
        sender: transaction.clawbackFrom!,
        receiver: transaction.receiver,
        verticals,
        parent,
        description: {
          type: TransactionGraphVisualizationDescriptionType.AssetTransfer,
          amount: transaction.amount,
          asset: transaction.asset,
        },
      }),
      closeOut,
    ].filter(isDefined)
  }

  return [
    foo({
      sender: transaction.sender,
      receiver: transaction.receiver,
      verticals,
      parent,
      description: {
        type: TransactionGraphVisualizationDescriptionType.AssetTransfer,
        amount: transaction.amount,
        asset: transaction.asset,
      },
    }),
    closeOut,
  ].filter(isDefined)
}

const foo = ({
  sender,
  receiver,
  verticals,
  description,
  parent,
}: {
  sender: Address
  receiver: Address
  verticals: TransactionGraphVertical[]
  description: TransactionGraphVisualizationDescription
  parent?: TransactionGraphHorizontal
}): TransactionGraphVisualization => {
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

  return asTransactionGraphVisualization(from, to, description)
}
