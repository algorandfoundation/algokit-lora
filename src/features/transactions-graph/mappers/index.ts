import {
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionGraphVisualization,
  TransactionsGraphData,
} from '@/features/transactions-graph'
import { InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { getVerticalsForTransactions } from '@/features/transactions-graph/mappers/verticals'
import { getAppCallTransactionVisualizations } from '@/features/transactions-graph/mappers/app-call-transaction'
import { getAssetConfigTransactionVisualizations } from '@/features/transactions-graph/mappers/asset-config-transaction'
import { getAssetFreezeTransactionVisualizations } from '@/features/transactions-graph/mappers/asset-freeze-transaction'
import { getAssetTransferTransactionVisualizations } from '@/features/transactions-graph/mappers/asset-transfer-transaction'
import { getKeyRegTransactionVisualizations } from '@/features/transactions-graph/mappers/key-reg-transaction'
import { getPaymentTransactionVisualizations } from '@/features/transactions-graph/mappers/payment-transaction'
import { getStateProofTransactionVisualizations } from '@/features/transactions-graph/mappers/state-proof-transaction'

export const asTransactionsGraphData = (transactions: Transaction[]): TransactionsGraphData => {
  const flattenedTransactions = transactions.flatMap((transaction) => flattenInnerTransactions(transaction))
  const verticals: TransactionGraphVertical[] = [
    ...getVerticalsForTransactions(flattenedTransactions.map((t) => t.transaction)),
    {
      id: -1,
      type: 'Placeholder',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  const horizontals = transactions.flatMap((txn) => getHorizontalsForTransaction(txn, verticals, [], false, 0))

  return {
    horizontals: horizontals,
    verticals: verticals,
  }
}

const getHorizontalsForTransaction = (
  transaction: Transaction | InnerTransaction,
  verticals: TransactionGraphVertical[],
  ancestors: TransactionGraphHorizontal[],
  hasNextSibling: boolean,
  depth: number
): TransactionGraphHorizontal[] => {
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const visualizations = getTransactionVisualizations(transaction, verticals, parent)
  const thisRow: TransactionGraphHorizontal = {
    transaction,
    visualizations,
    ancestors,
    hasNextSibling,
    depth,
  }
  if (transaction.type === TransactionType.AppCall && transaction.innerTransactions.length > 0) {
    return [
      thisRow,
      ...transaction.innerTransactions.flatMap((innerTxn, index) =>
        getHorizontalsForTransaction(
          innerTxn,
          verticals,
          [...ancestors, thisRow],
          index < transaction.innerTransactions.length - 1,
          depth + 1
        )
      ),
    ]
  }
  return [thisRow]
}

const getTransactionVisualizations = (
  transaction: Transaction | InnerTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization[] => {
  switch (transaction.type) {
    case TransactionType.AppCall:
      return getAppCallTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.AssetConfig:
      return getAssetConfigTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.AssetFreeze:
      return getAssetFreezeTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.AssetTransfer:
      return getAssetTransferTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.KeyReg:
      return getKeyRegTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.Payment:
      return getPaymentTransactionVisualizations(transaction, verticals, parent)
    case TransactionType.StateProof:
      return getStateProofTransactionVisualizations(transaction, verticals)
  }
}
