import {
  TransactionGraphAccountVertical,
  TransactionGraphApplicationVertical,
  TransactionGraphAssetVertical,
  TransactionGraphHorizontal,
  TransactionGraphPointVisualization,
  TransactionGraphSelfLoopVisualization,
  TransactionGraphVectorVisualization,
  TransactionGraphVertical,
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

const getVerticalsForTransactions = (transactions: Transaction[] | InnerTransaction[]): TransactionGraphVertical[] => {
  const transactionsVerticals = transactions.flatMap(asRawTransactionGraphVerticals)
  const mergedVerticals = mergeRawTransactionGraphVerticals(transactionsVerticals)
  return indexTransactionsVerticals(mergedVerticals)
}

const indexTransactionsVerticals = (rawVerticals: TransactionGraphVertical[]): TransactionGraphVertical[] => {
  const uniqueAddresses = rawVerticals
    .flatMap((vertical) => {
      switch (vertical.type) {
        case 'Account':
          return [vertical.accountAddress]
        case 'Asset':
          return []
        case 'Application':
          return [vertical.linkedAccount.accountAddress, ...vertical.rekeyedAccounts.map((account) => account.accountNumber)]
      }
    })
    .filter(distinct((x) => x))

  return rawVerticals.map((vertical, index) => {
    switch (vertical.type) {
      case 'Account':
        return {
          ...vertical,
          id: index,
          accountNumber: uniqueAddresses.indexOf(vertical.accountAddress) + 1,
        }
      case 'Asset':
        return { ...vertical, id: index }
      case 'Application':
        return {
          ...vertical,
          id: index,
          linkedAccount: {
            accountNumber: uniqueAddresses.indexOf(vertical.linkedAccount.accountAddress) + 1,
            accountAddress: vertical.linkedAccount.accountAddress,
          },
          rekeyedAccounts: vertical.rekeyedAccounts.map((account) => ({
            ...account,
            accountNumber: uniqueAddresses.indexOf(account.accountAddress) + 1,
          })),
        }
      default:
        throw new Error(`Unknown vertical type "${vertical.type}"`)
    }
  })
}

const mergeRawTransactionGraphVerticals = (verticals: TransactionGraphVertical[]): TransactionGraphVertical[] => {
  return verticals.reduce<TransactionGraphVertical[]>((acc, current, _, array) => {
    if (current.type === 'Account') {
      if (
        acc.some(
          (c) =>
            (c.type === 'Account' && c.accountAddress === current.accountAddress) ||
            // An application has its own account too
            (c.type === 'Application' && c.linkedAccount.accountAddress === current.accountAddress)
        )
      ) {
        return acc
      }
      // An application has its own account too
      const app = array.find((a) => a.type === 'Application' && a.linkedAccount.accountAddress === current.accountAddress)
      if (app) {
        return [...acc, app]
      }

      return [...acc, current]
    }
    if (current.type === 'Application') {
      const index = acc.findIndex((c) => c.type === 'Application' && c.applicationId === current.applicationId)
      // An application can send transactions on behalf of multiple accounts
      // We merge all the accounts, so we only show one application on the graph
      if (index > -1) {
        const applicationVertical = {
          id: -1,
          type: 'Application' as const,
          applicationId: current.applicationId,
          linkedAccount: current.linkedAccount,
          rekeyedAccounts: [...(acc[index] as TransactionGraphApplicationVertical).rekeyedAccounts, ...current.rekeyedAccounts].filter(
            distinct((x) => x.accountAddress)
          ),
        }
        acc.splice(index, 1, applicationVertical)
        return acc
      } else {
        return [...acc, current]
      }
    }
    if (current.type === 'Asset') {
      if (acc.some((c) => c.type === 'Asset' && c.assetId === current.assetId)) {
        return acc
      }
      return [...acc, current]
    } else return acc
  }, [])
}

const asRawTransactionGraphVerticals = (transaction: Transaction | InnerTransaction): TransactionGraphVertical[] => {
  const verticals: TransactionGraphVertical[] = [
    {
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    verticals.push({
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.AppCall) {
    verticals.push({
      id: -1,
      type: 'Application',
      applicationId: transaction.applicationId,
      linkedAccount: {
        accountNumber: -1,
        accountAddress: getApplicationAddress(transaction.applicationId),
      },
      rekeyedAccounts: transaction.innerTransactions
        .flatMap((innerTransaction) => innerTransaction.sender)
        .filter((address) => address !== getApplicationAddress(transaction.applicationId))
        .filter(distinct((x) => x))
        .map((address) => ({
          accountNumber: -1,
          accountAddress: address,
        })),
    })
  }
  if (transaction.type === TransactionType.AssetConfig) {
    verticals.push({
      id: -1,
      type: 'Asset',
      assetId: transaction.assetId,
    })
  }
  if (transaction.type === TransactionType.AssetFreeze) {
    verticals.push({
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.address,
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
      const accountVertical = verticals.find(
        (c): c is TransactionGraphAccountVertical => c.type === 'Account' && transaction.receiver === c.accountAddress
      )
      if (accountVertical) {
        return {
          verticalIndex: accountVertical.id,
          accountIndex: accountVertical.accountNumber,
        }
      }

      const applicationVertical = verticals.find(
        (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && transaction.receiver === c.linkedAccount.accountAddress
      )
      if (applicationVertical) {
        return {
          verticalIndex: applicationVertical.id,
          accountIndex: applicationVertical.linkedAccount.accountNumber,
        }
      }

      return undefined
    }

    if (transaction.type === TransactionType.AppCall) {
      const applicationVertical = verticals.find(
        (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && transaction.applicationId === c.applicationId
      )
      if (applicationVertical) {
        return {
          verticalIndex: applicationVertical.id,
        }
      }

      return undefined
    }

    if (transaction.type === TransactionType.AssetConfig) {
      const assetVertical = verticals.find(
        (c): c is TransactionGraphAssetVertical => c.type === 'Asset' && transaction.assetId === c.assetId
      )
      if (assetVertical) {
        return {
          verticalIndex: assetVertical.id,
        }
      }

      return undefined
    }

    if (transaction.type === TransactionType.AssetFreeze) {
      const accountVertical = verticals.find(
        (c): c is TransactionGraphAccountVertical => c.type === 'Account' && transaction.address === c.accountAddress
      )
      if (accountVertical) {
        return {
          verticalIndex: accountVertical.id,
          accountIndex: accountVertical.accountNumber,
        }
      }
    }

    throw new Error('Unsupported transaction type')
  }
  const calculateFrom = () => {
    if (!parent) {
      // If the transaction is not a child, it is sent an individual account or an application account
      const accountVertical = verticals.find(
        (c): c is TransactionGraphAccountVertical => c.type === 'Account' && transaction.sender === c.accountAddress
      )
      if (accountVertical) {
        return {
          verticalIndex: accountVertical.id,
          accountIndex: accountVertical.accountNumber,
        }
      }

      const applicationVertical = verticals.find(
        (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && transaction.sender === c.linkedAccount.accountAddress
      )
      if (applicationVertical) {
        return {
          verticalIndex: applicationVertical.id,
          accountIndex: applicationVertical.linkedAccount.accountNumber,
        }
      }
      // TODO: how to avoid undefined?
      return undefined
    }

    // If the transaction is child, the parent transaction must be an application call
    // The "from" must be the parent application call transaction
    const parentAppCallTransaction = parent.transaction as AppCallTransaction
    const applicationVertical = verticals.find(
      (c): c is TransactionGraphApplicationVertical =>
        c.type === 'Application' && c.applicationId === parentAppCallTransaction.applicationId
    )
    if (applicationVertical) {
      return {
        verticalIndex: applicationVertical.id,
        accountIndex:
          applicationVertical.linkedAccount.accountAddress === transaction.sender
            ? applicationVertical.linkedAccount.accountNumber
            : applicationVertical.rekeyedAccounts.find((account) => account.accountAddress === transaction.sender)?.accountNumber,
      }
    }

    // TODO: how to avoid undefined?
    return undefined
  }

  const from = calculateFrom()

  if (transaction.type === TransactionType.KeyReg || transaction.type === TransactionType.StateProof) {
    return {
      fromVerticalIndex: from?.verticalIndex ?? -1,
      fromAccountIndex: from?.accountIndex,
      type: 'point',
    } satisfies TransactionGraphPointVisualization
  }

  const to = calculateTo()
  if (from?.verticalIndex === to?.verticalIndex) {
    return {
      fromVerticalIndex: from?.verticalIndex ?? -1,
      fromAccountIndex: from?.accountIndex,
      type: 'selfLoop',
    } satisfies TransactionGraphSelfLoopVisualization
  }

  const direction = (from?.verticalIndex ?? 0) < (to?.verticalIndex ?? 0) ? 'leftToRight' : 'rightToLeft'

  return {
    fromVerticalIndex: Math.min(from?.verticalIndex ?? 0, to?.verticalIndex ?? 0),
    fromAccountIndex: from?.accountIndex,
    toVerticalIndex: Math.max(from?.verticalIndex ?? 0, to?.verticalIndex ?? 0),
    toAccountIndex: to?.accountIndex,
    direction: direction,
    type: 'vector',
  } satisfies TransactionGraphVectorVisualization
}
