import { GroupResult } from '@/features/groups/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type BlockResult = {
  round: number
  timestamp: number
  seed: string
  transactionIds: string[]
  genesisHash: string
  genesisId: string
  previousBlockHash: string
  rewardsLevel: number
  feeSink: string
  rewardsResidue: number
  currentProtocol: string
  rewardsCalculationRound: number
  rewardsPool: string
  transactionCounter: number
  transactionsRootSha256: string
}

export type BlocksExtract = {
  blockResults: BlockResult[]
  transactionResults: TransactionResult[]
  groupResults: GroupResult[]
}

export type Round = number

export enum SubscriberState {
  Stopped = 'Stopped',
  Started = 'Started',
}

export enum SubscriberStoppedReason {
  Error = 'Error',
  Inactivity = 'Inactivity',
}

export type SubscriberStoppedDetails =
  | {
      reason: SubscriberStoppedReason.Error
      error: Error
    }
  | {
      reason: SubscriberStoppedReason.Inactivity
    }

export type SubscriberStatus =
  | {
      state: SubscriberState.Started
    }
  | {
      state: SubscriberState.Stopped
      details: SubscriberStoppedDetails
      timestamp: number
    }
