import { BlockResult } from '@/features/blocks/data/types'
import { DataBuilder, dossierProxy, randomDate, randomNumberBetween, randomString } from '@makerx/ts-dossier'

export class BlockResultBuilder extends DataBuilder<BlockResult> {
  constructor(initialState?: BlockResult) {
    super(
      initialState
        ? initialState
        : {
            round: randomNumberBetween(0, 47959369),
            timestamp: randomDate().toISOString(),
            transactionIds: Array.from({ length: randomNumberBetween(1, 1000) }, () => randomString(52, 52)),
          }
    )
  }
}

export const blockResultBuilder = dossierProxy<BlockResultBuilder, BlockResult>(BlockResultBuilder)
