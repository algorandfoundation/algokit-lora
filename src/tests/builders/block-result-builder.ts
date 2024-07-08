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
            ['genesis-hash']: randomString(64, 64),
            ['genesis-id']: randomString(64, 64),
            ['previous-block-hash']: randomString(64, 64),
            ['txn-counter']: randomNumberBetween(1, 1000),
            ['transactions-root']: randomString(64, 64),
            ['transactions-root-sha256']: randomString(64, 64),
            rewards: {
              ['fee-sink']: randomString(64, 64),
              ['rewards-level']: randomNumberBetween(1, 1000),
              ['rewards-calculation-round']: randomNumberBetween(1, 1000),
              ['rewards-pool']: randomString(64, 64),
              ['rewards-residue']: randomNumberBetween(1, 1000),
              ['rewards-rate']: randomNumberBetween(1, 1000),
            },
            ['upgrade-state']: {
              ['current-protocol']: randomString(64, 64),
              ['next-protocol']: randomString(64, 64),
              ['next-protocol-approvals']: randomNumberBetween(1, 1000),
              ['next-protocol-vote-before']: randomNumberBetween(1, 1000),
              ['next-protocol-switch-on']: randomNumberBetween(1, 1000),
            },
          }
    )
  }
}

export const blockResultBuilder = dossierProxy<BlockResultBuilder, BlockResult>(BlockResultBuilder)
