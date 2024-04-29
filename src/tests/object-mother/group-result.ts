import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { groupResultBuilder } from '../builders/group-result-builder'

export const groupResultMother = {
  groupWithTransactions: (transactions: TransactionResult[]) => {
    return groupResultBuilder().withTransactionIds(transactions.map((t) => t.id))
  },
}
