import { BlockResult } from '@/features/blocks/data/types'
import { DataBuilder, dossierProxy, incrementedNumber, randomDate, randomNumberBetween, randomString } from '@makerx/ts-dossier'

export class BlockResultBuilder extends DataBuilder<BlockResult> {
  constructor(initialState?: BlockResult) {
    super(
      initialState
        ? initialState
        : {
            round: incrementedNumber('round'),
            timestamp: randomDate().getTime(),
            transactionIds: Array.from({ length: randomNumberBetween(1, 1000) }, () => randomString(52, 52)),
            seed: randomString(64, 64),
            genesisHash: randomString(64, 64),
            genesisId: randomString(64, 64),
            previousBlockHash: randomString(64, 64),
            parentTransactionCount: randomNumberBetween(1, 1000),
            fullTransactionCount: randomNumberBetween(1, 1000),
            transactionCounter: randomNumberBetween(1, 1000),
            transactionsRoot: randomString(64, 64),
            transactionsRootSha256: randomString(64, 64),
            rewards: {
              feeSink: randomString(64, 64),
              rewardsLevel: randomNumberBetween(1, 1000),
              rewardsCalculationRound: randomNumberBetween(1, 1000),
              rewardsPool: randomString(64, 64),
              rewardsResidue: randomNumberBetween(1, 1000),
              rewardsRate: randomNumberBetween(1, 1000),
            },
            upgradeState: {
              currentProtocol: randomString(64, 64),
              nextProtocol: randomString(64, 64),
              nextProtocolApprovals: randomNumberBetween(1, 1000),
              nextProtocolVoteBefore: randomNumberBetween(1, 1000),
              nextProtocolSwitchOn: randomNumberBetween(1, 1000),
            },
          }
    )
  }
}

export const blockResultBuilder = dossierProxy<BlockResultBuilder, BlockResult>(BlockResultBuilder)
