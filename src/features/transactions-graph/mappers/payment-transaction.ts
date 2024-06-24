import { InnerPaymentTransaction, PaymentTransaction } from '@/features/transactions/models'
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

export const getPaymentTransactionVisualizations = (
  transaction: PaymentTransaction | InnerPaymentTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  const one = foo({
    sender: transaction.sender,
    receiver: transaction.receiver,
    verticals,
    description: {
      type: TransactionGraphVisualizationDescriptionType.Payment,
      amount: transaction.amount,
    },
    parent,
  })
  if (transaction.closeRemainder) {
    const two = foo({
      sender: transaction.sender,
      receiver: transaction.closeRemainder.to,
      verticals,
      description: {
        type: TransactionGraphVisualizationDescriptionType.PaymentCloseOut,
        amount: transaction.closeRemainder.amount,
      },
      parent,
    })
    return [one, two]
  } else {
    return [one]
  }
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
