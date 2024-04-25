import { Transaction, InnerTransaction, TransactionType } from '../models'

export const getTransactionsCollaborators = (transactions: Transaction[]): Collaborator[] => {
  return transactions.reduce((acc, transaction) => {
    const collaborators = getTransactionCollaborators(transaction)
    collaborators.forEach((collaborator) => {
      if (!acc.some((c) => c.type === collaborator.type && c.id === collaborator.id)) {
        acc.push(collaborator)
      }
    })
    return acc
  }, new Array<Collaborator>())
}

const getTransactionCollaborators = (transaction: Transaction | InnerTransaction): Collaborator[] => {
  const collaborators: Collaborator[] = [
    {
      type: 'Account',
      id: transaction.sender,
    },
  ]
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) {
    collaborators.push({
      type: 'Account',
      id: transaction.receiver,
    })
  }
  if (transaction.type === TransactionType.ApplicationCall) {
    collaborators.push({
      type: 'Application',
      id: transaction.applicationId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetConfig) {
    collaborators.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  if (transaction.type === TransactionType.AssetFreeze) {
    collaborators.push({
      type: 'Asset',
      id: transaction.assetId.toString(),
    })
  }
  return collaborators
}

export type Collaborator = {
  type: 'Account' | 'Application' | 'Asset'
  id: string
}
