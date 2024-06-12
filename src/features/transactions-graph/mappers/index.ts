import {
  TransactionGraphApplicationVerticalLine,
  TransactionGraphVerticalLine,
  TransactionGraphPointVisualization,
  TransactionGraphHorizontalLine,
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
  const verticalLines: TransactionGraphVerticalLine[] = [
    ...getVerticalLinesForTransactions(flattenedTransactions.map((t) => t.transaction)),
    {
      type: 'Placeholder',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  const horizontalLines = transactions.flatMap((txn) => getHorizontalLinesForTransaction(txn, verticalLines, [], false, 0))

  return {
    horizontalLines: horizontalLines,
    verticalLines: verticalLines,
  }
}

const getVerticalLinesForTransactions = (transactions: Transaction[] | InnerTransaction[]): TransactionGraphVerticalLine[] => {
  const verticalLines = transactions.flatMap(getVerticalLinesForTransaction)
  return verticalLines.reduce<TransactionGraphVerticalLine[]>((acc, current, _, array) => {
    if (current.type === 'Account') {
      // TODO: why?
      if (
        acc.some(
          (c) => (c.type === 'Account' && c.address === current.address) || (c.type === 'Application' && c.address === current.address)
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
      // TODO: why?
      if (index > -1) {
        const newFoo = {
          type: 'Application' as const,
          id: current.id,
          address: current.address,
          accounts: [...(acc[index] as TransactionGraphApplicationVerticalLine).accounts, ...current.accounts].filter(
            distinct((x) => x.address)
          ),
        }
        acc.splice(index, 1, newFoo)
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

const getVerticalLinesForTransaction = (transaction: Transaction | InnerTransaction): TransactionGraphVerticalLine[] => {
  const verticalLines: TransactionGraphVerticalLine[] = [
    {
      type: 'Account',
      address: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    verticalLines.push({
      type: 'Account',
      address: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.ApplicationCall) {
    verticalLines.push({
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
    verticalLines.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetFreeze) {
    verticalLines.push({
      type: 'Account',
      address: transaction.address.toString(),
    })
  }
  return verticalLines
}

const getHorizontalLinesForTransaction = (
  transaction: Transaction | InnerTransaction,
  verticalLines: TransactionGraphVerticalLine[],
  ancestors: TransactionGraphHorizontalLine[],
  hasNextSibling: boolean,
  depth: number
): TransactionGraphHorizontalLine[] => {
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined
  const visualization = getTransactionVisualization(transaction, verticalLines, parent)
  const thisRow: TransactionGraphHorizontalLine = {
    transaction,
    visualization,
    ancestors,
    hasNextSibling,
    depth,
  }
  if (transaction.type === TransactionType.ApplicationCall && transaction.innerTransactions.length > 0) {
    return [
      thisRow,
      ...transaction.innerTransactions.flatMap((innerTxn, index) =>
        getHorizontalLinesForTransaction(
          innerTxn,
          verticalLines,
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
  verticalLines: TransactionGraphVerticalLine[],
  parent?: TransactionGraphHorizontalLine
): TransactionGraphVisualization => {
  const calculateTo = () => {
    if (transaction.type === TransactionType.AssetTransfer || transaction.type === TransactionType.Payment) {
      return verticalLines.findIndex(
        (c) =>
          (c.type === 'Account' && transaction.receiver === c.address) || (c.type === 'Application' && transaction.receiver === c.address)
      )
    }

    if (transaction.type === TransactionType.ApplicationCall) {
      return verticalLines.findIndex((c) => c.type === 'Application' && transaction.applicationId === c.id)
    }

    if (transaction.type === TransactionType.AssetConfig) {
      return verticalLines.findIndex((c) => c.type === 'Asset' && transaction.assetId.toString() === c.id)
    }

    if (transaction.type === TransactionType.AssetFreeze) {
      return verticalLines.findIndex((c) => c.type === 'Account' && transaction.address.toString() === c.address)
    }

    throw new Error('Not supported transaction type')
  }

  // TODO: why?
  const from = !parent
    ? verticalLines.findIndex(
        (c) =>
          (c.type === 'Account' && transaction.sender === c.address) ||
          (c.type === 'Application' && c.accounts.map((a) => a.address).includes(transaction.sender))
      )
    : // TODO: fix the typing
      verticalLines.findIndex((c) => c.type === 'Application' && c.id === (parent.transaction as AppCallTransaction).applicationId)

  if (transaction.type === TransactionType.KeyReg) {
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
