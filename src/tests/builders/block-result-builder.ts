import { BlockResult } from '@/features/blocks/data/types'
import { DataBuilder, dossierProxy, incrementedNumber, randomDate, randomNumberBetween, randomString } from '@makerx/ts-dossier'

export class BlockResultBuilder extends DataBuilder<BlockResult> {
  constructor(initialState?: BlockResult) {
    super(
      initialState
        ? initialState
        : {
            round: incrementedNumber('round'),
            timestamp: randomDate().toISOString(),
            ['transaction-ids']: Array.from({ length: randomNumberBetween(1, 1000) }, () => randomString(52, 52)),
            transactions: [],
            seed: randomString(64, 64),
            ['genesis-hash']: randomString(64, 64),
            ['genesis-id']: randomString(64, 64),
            ['previous-block-hash']: randomString(64, 64),
          }
    )
  }
}

export const blockResultBuilder = dossierProxy<BlockResultBuilder, BlockResult>(BlockResultBuilder)
