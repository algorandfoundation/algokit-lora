import { BlockResult } from '@/features/blocks/data/types'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { DataBuilder, dossierProxy, incrementedNumber, randomDate, randomNumberBetween, randomString } from '@makerx/ts-dossier'

export class BlockResultBuilder extends DataBuilder<BlockResult> {
  constructor(initialState?: BlockResult) {
    super(
      initialState
        ? initialState
        : {
            round: BigInt(incrementedNumber('round')),
            timestamp: randomDate().getTime(),
            transactionIds: Array.from({ length: randomNumberBetween(1, 1000) }, () => randomString(52, 52)),
            seed: base64ToBytes(randomString(64, 64)),
            genesisHash: base64ToBytes(randomString(64, 64)),
            genesisId: randomString(64, 64),
            previousBlockHash: base64ToBytes(randomString(64, 64)),
            txnCounter: randomNumberBetween(1, 1000),
            transactionsRoot: base64ToBytes(randomString(64, 64)),
            transactionsRootSha256: base64ToBytes(randomString(64, 64)),
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
            proposer: randomString(52, 52),
          }
    )
  }
}

export const blockResultBuilder = dossierProxy<BlockResultBuilder, BlockResult>(BlockResultBuilder)
