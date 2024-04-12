import { BlockMetadata } from '../data'
import { BlockModel } from '../models'

export const asBlockModel = (block: BlockMetadata) => {
  return {
    round: block.round,
    timestamp: block.timestamp,
    transactionCount: block.parentTransactionCount,
    transactionIds: block.transactionIds,
  } satisfies BlockModel
}
