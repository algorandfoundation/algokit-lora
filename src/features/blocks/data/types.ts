import { Address } from '@/features/accounts/data/types'
import { GroupResult } from '@/features/groups/data/types'
import { TransactionResult } from '@/features/transactions/data/types'

// Matches the data returned from indexer
export type BlockResult = {
  round: bigint
  timestamp: bigint
  genesisId: string
  genesisHash: Uint8Array
  previousBlockHash: Uint8Array
  seed: Uint8Array
  rewards?: BlockRewards
  txnCounter: number
  transactionsRoot: Uint8Array
  transactionsRootSha256: Uint8Array
  upgradeState?: BlockUpgradeState
  transactionIds: string[]
  stateProofTracking?: StateProofTracking[]
  upgradeVote?: BlockUpgradeVote
  participationUpdates?: ParticipationUpdates
  proposer?: Address
}

export type BlockRewards = {
  feeSink: string
  rewardsCalculationRound: number | bigint
  rewardsLevel: number | bigint
  rewardsPool: string
  rewardsRate: number | bigint
  rewardsResidue: number | bigint
}

export type BlockUpgradeState = {
  currentProtocol: string
  nextProtocol?: string
  nextProtocolApprovals?: number | bigint
  nextProtocolSwitchOn?: number | bigint
  nextProtocolVoteBefore?: number | bigint
}

export type StateProofTracking = {
  nextRound?: number | bigint
  onlineTotalWeight?: number | bigint
  type?: number | bigint
  votersCommitment?: string | Uint8Array
}

export interface BlockUpgradeVote {
  upgradeApprove?: boolean
  upgradeDelay?: number | bigint
  upgradePropose?: string
}

export interface ParticipationUpdates {
  absentParticipationAccounts?: string[]
  expiredParticipationAccounts?: string[]
}

export type BlocksExtract = {
  blockResults: BlockResult[]
  transactionResults: TransactionResult[]
  groupResults: GroupResult[]
}

export type Round = bigint

export enum SubscriberState {
  NotStarted = 'NotStarted',
  Started = 'Started',
  Stopped = 'Stopped',
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
      state: SubscriberState.NotStarted
    }
  | {
      state: SubscriberState.Started
    }
  | {
      state: SubscriberState.Stopped
      details: SubscriberStoppedDetails
      timestamp: number
    }
