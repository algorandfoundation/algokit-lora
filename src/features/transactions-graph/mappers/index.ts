import {
  ApplicationSwimlane,
  getRandomColor,
  Swimlane,
  TransactionGraphPoint,
  TransactionGraphRow,
  TransactionGraphSelfLoop,
  TransactionGraphVector,
  TransactionGraphVisualization,
  TransactionsGraph,
} from '@/features/transactions-graph'
import { AppCallTransaction, InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { distinct } from '@/utils/distinct'
import { getApplicationAddress } from 'algosdk'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'

export const asTransactionsGraph = (transactions: Transaction[]): TransactionsGraph => {
  const flattenedTransactions = transactions.flatMap((transaction) => flattenInnerTransactions(transaction))
  const swimlanes: Swimlane[] = [
    ...getTransactionsSwimlanes(flattenedTransactions.map((t) => t.transaction)),
    {
      type: 'Placeholder',
    }, // an empty account to make room to show transactions with the same sender and receiver
  ]
  const rows = transactions.flatMap((txn) => getTransactionGraphRows(txn, swimlanes, 0, undefined))

  return {
    transactions, //TODO: probably rename to top level transactions
    rows,
    swimlanes,
  }
}

const getTransactionsSwimlanes = (transactions: Transaction[] | InnerTransaction[]): Swimlane[] => {
  const swimlanes = transactions.flatMap(getTransactionSwimlanes)
  return swimlanes.reduce<Swimlane[]>((acc, current, _, array) => {
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
          accounts: [...(acc[index] as ApplicationSwimlane).accounts, ...current.accounts].filter(distinct((x) => x.address)),
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

const getTransactionSwimlanes = (transaction: Transaction | InnerTransaction): Swimlane[] => {
  const swimlanes: Swimlane[] = [
    {
      type: 'Account',
      address: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    swimlanes.push({
      type: 'Account',
      address: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.ApplicationCall) {
    swimlanes.push({
      type: 'Application',
      id: transaction.applicationId,
      address: getApplicationAddress(transaction.applicationId),
      accounts: transaction.innerTransactions
        .flatMap((innerTransaction) => innerTransaction.sender)
        .filter((address) => address !== getApplicationAddress(transaction.applicationId))
        .filter(distinct((x) => x))
        .map((address) => ({
          address,
          color: getRandomColor(),
        })),
    })
  }
  if (transaction.type === TransactionType.AssetConfig) {
    swimlanes.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetFreeze) {
    swimlanes.push({
      type: 'Account',
      address: transaction.address.toString(),
    })
  }
  return swimlanes
}

const getTransactionGraphRows = (
  transaction: Transaction | InnerTransaction,
  swimlanes: Swimlane[],
  nestingLevel: number = 0,
  parent: TransactionGraphRow | undefined
): TransactionGraphRow[] => {
  const visualization = getTransactionVisualization(transaction, swimlanes, parent)
  const thisRow: TransactionGraphRow = {
    transaction,
    visualization,
    nestingLevel: nestingLevel,
    parent,
  }
  if (transaction.type === TransactionType.ApplicationCall && transaction.innerTransactions.length > 0) {
    return [
      thisRow,
      ...transaction.innerTransactions.flatMap((innerTransaction) =>
        getTransactionGraphRows(innerTransaction, swimlanes, nestingLevel + 1, thisRow)
      ),
    ]
  }
  return [thisRow]
}

const getTransactionVisualization = (
  transaction: Transaction | InnerTransaction,
  swimlanes: Swimlane[],
  parent?: TransactionGraphRow
): TransactionGraphVisualization => {
  const calculateTo = () => {
    if (transaction.type === TransactionType.AssetTransfer || transaction.type === TransactionType.Payment) {
      return swimlanes.findIndex(
        (c) =>
          (c.type === 'Account' && transaction.receiver === c.address) || (c.type === 'Application' && transaction.receiver === c.address)
      )
    }

    if (transaction.type === TransactionType.ApplicationCall) {
      return swimlanes.findIndex((c) => c.type === 'Application' && transaction.applicationId === c.id)
    }

    if (transaction.type === TransactionType.AssetConfig) {
      return swimlanes.findIndex((c) => c.type === 'Asset' && transaction.assetId.toString() === c.id)
    }

    if (transaction.type === TransactionType.AssetFreeze) {
      return swimlanes.findIndex((c) => c.type === 'Account' && transaction.address.toString() === c.address)
    }

    throw new Error('Not supported transaction type')
  }

  // TODO: why?
  const from = !parent
    ? swimlanes.findIndex(
        (c) =>
          (c.type === 'Account' && transaction.sender === c.address) ||
          (c.type === 'Application' && c.accounts.map((a) => a.address).includes(transaction.sender))
      )
    : // HACK: fix the typing
      swimlanes.findIndex((c) => c.type === 'Application' && c.id === (parent.transaction as AppCallTransaction).applicationId)

  if (transaction.type === TransactionType.KeyReg) {
    return {
      from: from,
      type: 'point',
    } satisfies TransactionGraphPoint
  }

  const to = calculateTo()
  if (from === to) {
    return {
      from: from,
      type: 'selfLoop',
    } satisfies TransactionGraphSelfLoop
  }

  const direction = from < to ? 'leftToRight' : 'rightToLeft'

  return {
    from: Math.min(from, to),
    to: Math.max(from, to),
    direction: direction,
    type: 'vector',
  } satisfies TransactionGraphVector
}
