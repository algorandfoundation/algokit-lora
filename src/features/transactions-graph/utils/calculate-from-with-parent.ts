import { Address } from '@/features/accounts/data/types'
import {
  fallbackFromTo,
  TransactionGraphApplicationVertical,
  TransactionGraphHorizontal,
  TransactionGraphVertical,
  TransactionVisualisationFromTo,
} from '@/features/transactions-graph'
import { AppCallTransaction } from '@/features/transactions/models'

export const calculateFromWithParent = (
  sender: Address,
  verticals: TransactionGraphVertical[],
  parent: TransactionGraphHorizontal
): TransactionVisualisationFromTo => {
  // If the transaction is child, the parent transaction must be an application call
  // The "from" must be the parent application call transaction
  const parentAppCallTransaction = parent.transaction as AppCallTransaction
  const applicationVertical = verticals.find(
    (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && c.applicationId === parentAppCallTransaction.applicationId
  )
  if (applicationVertical) {
    return {
      verticalId: applicationVertical.id,
      accountNumber:
        applicationVertical.linkedAccount.accountAddress === sender
          ? applicationVertical.linkedAccount.accountNumber
          : applicationVertical.rekeyedAccounts.find((account) => account.accountAddress === sender)?.accountNumber,
    }
  }
  return fallbackFromTo
}
