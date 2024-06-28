import { GroupResult } from '@/features/groups/data/types'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type BlockResult = {
  round: number
  timestamp: string
  transactionIds: string[]
}

export type BlocksExtract = {
  blockResults: BlockResult[]
  transactionResults: TransactionResult[]
  groupResults: GroupResult[]
}

export type Round = number

export enum SubscriberState {
  Failed = 'Failed',
  Running = 'Running',
}

export type SubscriberStatus =
  | {
      state: SubscriberState.Running
    }
  | {
      state: SubscriberState.Failed
      error: Error
      timestamp: number
    }
