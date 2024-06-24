import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { Address } from '@/features/accounts/data/types'
import { ApplicationId } from '@/features/applications/data/types'
import { AssetId } from '@/features/assets/data/types'

export type TransactionsGraphData = {
  horizontals: TransactionGraphHorizontal[]
  verticals: TransactionGraphVertical[]
}

export type TransactionGraphHorizontal = {
  ancestors: TransactionGraphHorizontal[]
  transaction: Transaction | InnerTransaction
  visualizations: TransactionGraphVisualization[]
  hasNextSibling: boolean
  depth: number
}

export type TransactionGraphVisualization =
  | TransactionGraphVectorVisualization
  | TransactionGraphSelfLoopVisualization
  | TransactionGraphPointVisualization

export type TransactionGraphVectorVisualization = {
  type: 'vector'
  overrideDescription?: string
  fromVerticalIndex: number
  fromAccountIndex?: number
  toAccountIndex?: number
  toVerticalIndex: number
  direction: 'leftToRight' | 'rightToLeft'
}

export type TransactionGraphSelfLoopVisualization = {
  type: 'selfLoop'
  overrideDescription?: string
  fromVerticalIndex: number
  fromAccountIndex?: number
}

export type TransactionGraphPointVisualization = {
  type: 'point'
  overrideDescription?: string
  fromVerticalIndex: number
  fromAccountIndex?: number
}

export type TransactionGraphAccountVertical = {
  id: number
  accountNumber: number
  type: 'Account'
  accountAddress: Address
}
export type TransactionGraphApplicationVertical = {
  id: number
  type: 'Application'
  applicationId: ApplicationId
  linkedAccount: { accountNumber: number; accountAddress: Address }
  rekeyedAccounts: {
    accountNumber: number
    accountAddress: Address
  }[]
}
export type TransactionGraphAssetVertical = {
  id: number
  type: 'Asset'
  assetId: AssetId
}
export type TransactionGraphOpUpVertical = {
  id: number
  type: 'OpUp'
}
export type TransactionGraphPlaceholderVertical = {
  id: number
  type: 'Placeholder'
}

export type TransactionGraphVertical =
  | TransactionGraphAccountVertical
  | TransactionGraphApplicationVertical
  | TransactionGraphAssetVertical
  | TransactionGraphOpUpVertical
  | TransactionGraphPlaceholderVertical

export type TransactionVisualisationFromTo = {
  verticalId: number
  accountNumber?: number
}
// Fallback value, it should never happen, just to make TypeScript happy
export const fallbackFromTo: TransactionVisualisationFromTo = {
  verticalId: -1,
  accountNumber: undefined,
}
