import { AssetTransferTransactionSubType, InnerTransaction, Transaction, TransactionType } from '@/features/transactions/models'
import { ApplicationVertical, Vertical } from '../models'
import { distinct } from '@/utils/distinct'
import { getApplicationAddress } from 'algosdk'

export const getVerticalsForTransactions = (transactions: Transaction[] | InnerTransaction[]): Vertical[] => {
  const transactionsVerticals = transactions.flatMap(asRawTransactionGraphVerticals)
  const mergedVerticals = mergeRawTransactionGraphVerticals(transactionsVerticals)
  return indexTransactionsVerticals(mergedVerticals)
}

const indexTransactionsVerticals = (rawVerticals: Vertical[]): Vertical[] => {
  const uniqueAddresses = rawVerticals
    .flatMap((vertical) => {
      switch (vertical.type) {
        case 'Account':
          return [vertical.accountAddress, ...vertical.associatedAccounts.map((account) => account.accountAddress)]
        case 'Asset':
          return []
        case 'Application':
          return [vertical.linkedAccount.accountAddress, ...vertical.associatedAccounts.map((account) => account.accountAddress)]
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
          associatedAccounts: vertical.associatedAccounts.map((account) => ({
            ...account,
            accountNumber: uniqueAddresses.indexOf(account.accountAddress) + 1,
          })),
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
          associatedAccounts: vertical.associatedAccounts.map((account) => ({
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

const mergeRawTransactionGraphVerticals = (verticals: Vertical[]): Vertical[] => {
  return verticals.reduce<Vertical[]>((acc, current, _, array) => {
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

      // An account can have associated accounts, if it does prefer this vertical
      const accountWithAssociatedAccounts = array.find(
        (a) => a.type === 'Account' && a.accountAddress === current.accountAddress && a.associatedAccounts.length > 0
      )
      if (accountWithAssociatedAccounts) {
        return [...acc, accountWithAssociatedAccounts]
      }

      return [...acc, current]
    }
    if (current.type === 'Application') {
      const index = acc.findIndex((c) => c.type === 'Application' && c.applicationId === current.applicationId)
      // An application can send transactions on behalf of multiple accounts
      // We merge all the accounts, so we only show one vertical on the graph
      if (index > -1) {
        const applicationVertical = {
          id: -1,
          type: 'Application' as const,
          applicationId: current.applicationId,
          linkedAccount: current.linkedAccount,
          associatedAccounts: [...(acc[index] as ApplicationVertical).associatedAccounts, ...current.associatedAccounts].filter(
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

const asRawTransactionGraphVerticals = (transaction: Transaction | InnerTransaction): Vertical[] => {
  const verticals: Vertical[] = [
    {
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.sender,
      associatedAccounts:
        transaction.type === TransactionType.AssetTransfer &&
        transaction.subType === AssetTransferTransactionSubType.Clawback &&
        transaction.clawbackFrom
          ? [{ type: 'Clawback', accountNumber: -1, accountAddress: transaction.clawbackFrom }]
          : [],
    },
  ]
  if (transaction.type === TransactionType.Payment) {
    verticals.push({
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.receiver,
      associatedAccounts: [],
    })
    if (transaction.closeRemainder) {
      verticals.push({
        id: -1,
        accountNumber: -1,
        type: 'Account',
        accountAddress: transaction.closeRemainder.to,
        associatedAccounts: [],
      })
    }
  }
  if (transaction.type === TransactionType.AssetTransfer) {
    verticals.push({
      id: -1,
      accountNumber: -1,
      type: 'Account',
      accountAddress: transaction.receiver,
      associatedAccounts: [],
    })
    if (transaction.closeRemainder) {
      verticals.push({
        id: -1,
        accountNumber: -1,
        type: 'Account',
        accountAddress: transaction.closeRemainder.to,
        associatedAccounts: [],
      })
    }
  }
  if (transaction.type === TransactionType.AppCall) {
    if (transaction.isOpUp) {
      verticals.push({
        id: -1,
        type: 'OpUp',
      })
    } else {
      const associatedAccounts = transaction.innerTransactions
        .reduce(
          (acc, itxn) => {
            if (itxn.sender !== getApplicationAddress(transaction.applicationId)) {
              acc.push({
                type: 'Rekey',
                accountNumber: -1,
                accountAddress: itxn.sender,
              })
            }

            if (
              itxn.type === TransactionType.AssetTransfer &&
              itxn.subType === AssetTransferTransactionSubType.Clawback &&
              itxn.clawbackFrom
            ) {
              acc.push({
                type: 'Clawback',
                accountNumber: -1,
                accountAddress: itxn.clawbackFrom,
              })
            }

            return acc
          },
          [] as ApplicationVertical['associatedAccounts']
        )
        .filter(distinct((a) => a.accountAddress))

      verticals.push({
        id: -1,
        type: 'Application',
        applicationId: transaction.applicationId,
        linkedAccount: {
          accountNumber: -1,
          accountAddress: getApplicationAddress(transaction.applicationId),
        },
        associatedAccounts,
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
      associatedAccounts: [],
    })
  }
  return verticals
}
