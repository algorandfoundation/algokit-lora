import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { Address } from '@/features/accounts/data/types'

export type TransactionsGraphData = {
  horizontals: TransactionGraphHorizontal[]
  verticals: TransactionGraphVertical[]
}

export type TransactionGraphHorizontal = {
  ancestors: TransactionGraphHorizontal[]
  transaction: Transaction | InnerTransaction
  visualization: TransactionGraphVisualization
  hasNextSibling: boolean
  depth: number
}

export type TransactionGraphVisualization =
  | TransactionGraphVectorVisualization
  | TransactionGraphSelfLoopVisualization
  | TransactionGraphPointVisualization

export type TransactionGraphVectorVisualization = {
  type: 'vector'
  fromVerticalIndex: number
  fromAccountIndex?: number
  toAccountIndex?: number
  toVerticalIndex: number
  direction: 'leftToRight' | 'rightToLeft'
}

export type TransactionGraphSelfLoopVisualization = {
  type: 'selfLoop'
  fromVerticalIndex: number
  fromAccountIndex?: number
}

export type TransactionGraphPointVisualization = {
  type: 'point'
  fromVerticalIndex: number
  fromAccountIndex?: number
}

export type TransactionGraphAccountVertical = {
  id: number
  index: number
  type: 'Account'
  address: string
}
export type TransactionGraphApplicationVertical = {
  id: number
  type: 'Application'
  applicationId: number
  linkedAccount: { index: number; address: Address }
  rekeyedAccounts: {
    index: number
    address: Address
  }[]
}
export type TransactionGraphAssetVertical = {
  id: number
  type: 'Asset'
  assetId: number
}
export type TransactionGraphVertical =
  | TransactionGraphAccountVertical
  | TransactionGraphApplicationVertical
  | TransactionGraphAssetVertical
  | { id: -1; type: 'Placeholder' }
