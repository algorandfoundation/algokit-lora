import { GroupResult } from '@/features/groups/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

// Matches the data returned from indexer
export type BlockResult = {
  round: number
  timestamp: number
  ['genesis-id']: string
  ['genesis-hash']: string
  ['previous-block-hash']?: string
  seed: string
  rewards?: BlockRewards
  ['txn-counter']: number
  ['transactions-root']: string
  ['transactions-root-sha256']: string
  ['upgrade-state']?: BlockUpgradeState
  transactionIds: string[]
  ['state-proof-tracking']?: BlockStateProofTracking[]
  ['upgrade-vote']?: BlockUpgradeVote
  ['participation-updates']?: ParticipationUpdates
}

export type BlockRewards = {
  ['fee-sink']: string
  ['rewards-level']: number
  ['rewards-calculation-round']: number
  ['rewards-pool']: string
  ['rewards-residue']: number
  ['rewards-rate']: number
}

export type BlockUpgradeState = {
  ['current-protocol']: string
  ['next-protocol']?: string
  ['next-protocol-approvals']?: number
  ['next-protocol-vote-before']?: number
  ['next-protocol-switch-on']?: number
}

export type BlockStateProofTracking = {
  ['next-round']?: number
  ['online-total-weight']?: number
  type?: number
  ['voters-commitment']?: string
}

export interface BlockUpgradeVote {
  ['upgrade-approve']?: boolean
  ['upgrade-delay']?: number | bigint
  ['upgrade-propose']?: string
}

export interface ParticipationUpdates {
  ['absent-participation-accounts']?: string[]
  ['expired-participation-accounts']?: string[]
}

export type BlocksExtract = {
  blockResults: BlockResult[]
  transactionResults: TransactionResult[]
  groupResults: GroupResult[]
}

export type Round = number

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
