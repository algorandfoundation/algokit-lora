import {
  TransactionGraphApplicationVertical,
  TransactionGraphVertical,
  TransactionGraphPointVisualization,
  TransactionGraphHorizontal,
  TransactionGraphSelfLoopVisualization,
  TransactionGraphVectorVisualization,
  TransactionGraphVisualization,
  TransactionsGraphData,
} from '@/features/transactions-graph'
import { AppCallTransaction, InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { distinct } from '@/utils/distinct'
import { getApplicationAddress } from 'algosdk'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

export const asTransactionsGraphData = (transactions: Transaction[]): TransactionsGraphData => {
  const flattenedTransactions = transactions.flatMap((transaction) => flattenInnerTransactions(transaction))
  const verticals: TransactionGraphVertical[] = [
    ...getVerticalsForTransactions(flattenedTransactions.map((t) => t.transaction)),
    {
      type: 'Placeholder',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  const horizontals = transactions.flatMap((txn) => getHorizontalsForTransaction(txn, verticals, [], false, 0))

  return {
    horizontals: horizontals,
    verticals: verticals,
  }
}

const getVerticalsForTransactions = (transactions: Transaction[] | InnerTransaction[]): TransactionGraphVertical[] => {
  const verticals = transactions.flatMap(getVerticalsForTransaction)
  return verticals.reduce<TransactionGraphVertical[]>((acc, current, _, array) => {
    if (current.type === 'Account') {
      if (
        acc.some(
          (c) =>
            (c.type === 'Account' && c.address === current.address) ||
            // An application has its own account too
            (c.type === 'Application' && c.address === current.address)
        )
      ) {
        return acc
      }
      const app = array.find((a) => a.type === 'Application' && a.address === current.address)
      if (app) {
        return [...acc, app]
      }

      return [...acc, current]
    }
    if (current.type === 'Application') {
      const index = acc.findIndex((c) => c.type === 'Application' && c.id === current.id)
      // An application can send transactions on behalf of multiple accounts
      // We merge all the accounts, so we only show one application on the graph
      if (index > -1) {
        const applicationVertical = {
          type: 'Application' as const,
          id: current.id,
          address: current.address,
          accounts: [...(acc[index] as TransactionGraphApplicationVertical).accounts, ...current.accounts].filter(
            distinct((x) => x.address)
          ),
        }
        acc.splice(index, 1, applicationVertical)
        return acc
      } else {
        return [...acc, current]
      }
    }
    if (current.type === 'Asset') {
      if (acc.some((c) => c.type === 'Asset' && c.id === current.id)) {
        return acc
      }
      return [...acc, current]
    } else return acc
  }, [])
}

const getVerticalsForTransaction = (transaction: Transaction | InnerTransaction): TransactionGraphVertical[] => {
  const verticals: TransactionGraphVertical[] = [
    {
      type: 'Account',
      address: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    verticals.push({
      type: 'Account',
      address: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.AppCall) {
    verticals.push({
      type: 'Application',
      id: transaction.applicationId,
      address: getApplicationAddress(transaction.applicationId),
      accounts: transaction.innerTransactions
        .flatMap((innerTransaction) => innerTransaction.sender)
        .filter((address) => address !== getApplicationAddress(transaction.applicationId))
        .filter(distinct((x) => x))
        .map((address) => ({
          address,
        })),
    })
  }
  if (transaction.type === TransactionType.AssetConfig) {
    verticals.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetFreeze) {
    verticals.push({
      type: 'Account',
      address: transaction.address.toString(),
    })
  }
  return verticals
}

const getHorizontalsForTransaction = (
  transaction: Transaction | InnerTransaction,
  verticals: TransactionGraphVertical[],
  ancestors: TransactionGraphHorizontal[],
  hasNextSibling: boolean,
  depth: number
): TransactionGraphHorizontal[] => {
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const visualization = getTransactionVisualization(transaction, verticals, parent)
  const thisRow: TransactionGraphHorizontal = {
    transaction,
    visualization,
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

const getTransactionVisualization = (
  transaction: Transaction | InnerTransaction,
  verticals: TransactionGraphVertical[],
  parent?: TransactionGraphHorizontal
): TransactionGraphVisualization => {
  const calculateTo = () => {
    if (transaction.type === TransactionType.AssetTransfer || transaction.type === TransactionType.Payment) {
      return verticals.findIndex(
        (c) =>
          (c.type === 'Account' && transaction.receiver === c.address) || (c.type === 'Application' && transaction.receiver === c.address)
      )
    }

    if (transaction.type === TransactionType.AppCall) {
      return verticals.findIndex((c) => c.type === 'Application' && transaction.applicationId === c.id)
    }

    if (transaction.type === TransactionType.AssetConfig) {
      return verticals.findIndex((c) => c.type === 'Asset' && transaction.assetId.toString() === c.id)
    }

    if (transaction.type === TransactionType.AssetFreeze) {
      return verticals.findIndex((c) => c.type === 'Account' && transaction.address.toString() === c.address)
    }

    throw new Error('Unsupported transaction type')
  }
  const calculateFrom = () => {
    // If the transaction is child, the parent transaction must be an application call
    // The "from" must be the parent application call transaction
    if (!parent) {
      return verticals.findIndex(
        (c) =>
          (c.type === 'Account' && transaction.sender === c.address) ||
          (c.type === 'Application' && c.accounts.map((a) => a.address).includes(transaction.sender))
      )
    }

    const parentAppCallTransaction = parent.transaction as AppCallTransaction
    return verticals.findIndex((c) => c.type === 'Application' && c.id === parentAppCallTransaction.applicationId)
  }

  const from = calculateFrom()

  if (transaction.type === TransactionType.KeyReg || transaction.type === TransactionType.StateProof) {
    return {
      from: from,
      type: 'point',
    } satisfies TransactionGraphPointVisualization
  }

  const to = calculateTo()
  if (from === to) {
    return {
      from: from,
      type: 'selfLoop',
    } satisfies TransactionGraphSelfLoopVisualization
  }

  const direction = from < to ? 'leftToRight' : 'rightToLeft'

  return {
    from: Math.min(from, to),
    to: Math.max(from, to),
    direction: direction,
    type: 'vector',
  } satisfies TransactionGraphVectorVisualization
}
