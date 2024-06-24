import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { blockResultBuilder } from '../builders/block-result-builder'

export const blockResultMother = {
  blockWithTransactions: (transactions: TransactionResult[]) => {
    return blockResultBuilder()['withTransaction-ids'](transactions.map((t) => t.id))
  },
  blockWithoutTransactions: () => {
    return blockResultBuilder()['withTransaction-ids']([])
  },
}
