import { blockMetadataBuilder } from '../builders/block-metadata-builder'

export const blockMetadataMother = {
  blockWithTransactions: () => {
    return blockMetadataBuilder()
  },
  blockWithoutTransactions: () => {
    return blockMetadataBuilder().withParentTransactionCount(0).withTransactionIds([])
  },
}
