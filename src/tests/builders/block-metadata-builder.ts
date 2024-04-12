import { BlockMetadata } from '@/features/blocks/data'
import { DataBuilder, dossierProxy, randomDate, randomNumberBetween, randomString } from '@makerx/ts-dossier'

export class BlockMetadataBuilder extends DataBuilder<BlockMetadata> {
  constructor(initialState?: BlockMetadata) {
    const transactionCount = randomNumberBetween(1, 1000)
    super(
      initialState
        ? initialState
        : {
            round: randomNumberBetween(0, 47959369),
            timestamp: randomDate().toISOString(),
            parentTransactionCount: transactionCount,
            transactionIds: Array.from({ length: transactionCount }, () => randomString(52, 52)),
          }
    )
  }
}

export const blockMetadataBuilder = dossierProxy<BlockMetadataBuilder, BlockMetadata>(BlockMetadataBuilder)
