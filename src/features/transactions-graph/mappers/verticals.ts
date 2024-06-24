import {
  AppCallTransactionSubType,
  AssetTransferTransactionSubType,
  InnerTransaction,
  Transaction,
  TransactionType,
} from '@/features/transactions/models'
import { TransactionGraphApplicationVertical, TransactionGraphVertical } from '@/features/transactions-graph'
import { distinct } from '@/utils/distinct'
import { getApplicationAddress } from 'algosdk'

export const getVerticalsForTransactions = (transactions: Transaction[] | InnerTransaction[]): TransactionGraphVertical[] => {
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
          return [vertical.linkedAccount.accountAddress, ...vertical.rekeyedAccounts.map((account) => account.accountAddress)]
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
      case 'OpUp':
        return { ...vertical, id: index }
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
    }
    if (current.type === 'OpUp') {
      if (acc.some((c) => c.type === 'OpUp')) {
        return acc
      }
      return [...acc, current]
    }
    return acc
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
  if (transaction.type === TransactionType.Payment) {
    verticals.push({
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.receiver,
    })
    if (transaction.closeRemainder) {
      verticals.push({
        id: -1,
        accountNumber: -1,
        type: 'Account',
        accountAddress: transaction.closeRemainder.to,
      })
    }
  }
  if (transaction.type === TransactionType.AssetTransfer) {
    if (transaction.subType === AssetTransferTransactionSubType.Clawback) {
      verticals.push({
        id: -1,
        accountNumber: -1,
        type: 'Account',
        accountAddress: transaction.clawbackFrom!,
      })
    }
    verticals.push({
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.receiver,
    })
    if (transaction.closeRemainder) {
      verticals.push({
        id: -1,
        accountNumber: -1,
        type: 'Account',
        accountAddress: transaction.closeRemainder.to,
      })
    }
  }
  if (transaction.type === TransactionType.AppCall) {
    if (transaction.subType === AppCallTransactionSubType.OpUp) {
      verticals.push({
        id: -1,
        type: 'OpUp',
      })
    } else {
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
