import { Address } from '@/features/accounts/data/types'
import {
  fallbackFromTo,
  TransactionGraphAccountVertical,
  TransactionGraphApplicationVertical,
  TransactionGraphVertical,
  TransactionVisualisationFromTo,
} from '@/features/transactions-graph'

export const calculateFromNoParent = (sender: Address, verticals: TransactionGraphVertical[]): TransactionVisualisationFromTo => {
  // If the transaction is not a child, it is sent an individual account or an application account
  const accountVertical = verticals.find((c): c is TransactionGraphAccountVertical => c.type === 'Account' && sender === c.accountAddress)
  if (accountVertical) {
    return {
      verticalId: accountVertical.id,
      accountNumber: accountVertical.accountNumber,
    }
  }

  const applicationVertical = verticals.find(
    (c): c is TransactionGraphApplicationVertical => c.type === 'Application' && sender === c.linkedAccount.accountAddress
  )
  if (applicationVertical) {
    return {
      verticalId: applicationVertical.id,
      accountNumber: applicationVertical.linkedAccount.accountNumber,
    }
  }
  return fallbackFromTo
}
