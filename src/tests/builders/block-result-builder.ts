import { BlockResult } from '@/features/blocks/data/types'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { DataBuilder, dossierProxy, incrementedNumber, randomDate, randomNumberBetween, randomString } from '@makerx/ts-dossier'
import { randomBigIntBetween } from '../utils/random-bigint'

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
            txnCounter: randomBigIntBetween(1n, 1000n),
            transactionsRoot: base64ToBytes(randomString(64, 64)),
            transactionsRootSha256: base64ToBytes(randomString(64, 64)),
            rewards: {
              feeSink: randomString(64, 64),
              rewardsLevel: randomBigIntBetween(1n, 1000n),
              rewardsCalculationRound: randomBigIntBetween(1n, 1000n),
              rewardsPool: randomString(64, 64),
              rewardsResidue: randomBigIntBetween(1n, 1000n),
              rewardsRate: randomBigIntBetween(1n, 1000n),
            },
            upgradeState: {
              currentProtocol: randomString(64, 64),
              nextProtocol: randomString(64, 64),
              nextProtocolApprovals: randomBigIntBetween(1n, 1000n),
              nextProtocolVoteBefore: randomBigIntBetween(1n, 1000n),
              nextProtocolSwitchOn: randomBigIntBetween(1n, 1000n),
            },
            proposer: randomString(52, 52),
          }
    )
  }
}

export const blockResultBuilder = dossierProxy<BlockResultBuilder, BlockResult>(BlockResultBuilder)
