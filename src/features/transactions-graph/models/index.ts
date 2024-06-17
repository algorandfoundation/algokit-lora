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
  from: number
  to: number
  direction: 'leftToRight' | 'rightToLeft'
}

export type TransactionGraphSelfLoopVisualization = {
  type: 'selfLoop'
  from: number
}

export type TransactionGraphPointVisualization = {
  type: 'point'
  from: number
}

export type TransactionGraphAccountVertical = {
  index: number
  type: 'Account'
  address: string
}
export type TransactionGraphApplicationVertical = {
  type: 'Application'
  id: number
  address: Address
  accounts: {
    index: number
    address: Address
  }[]
}
export type TransactionGraphAssetVertical = {
  type: 'Asset'
  id: string
}
export type TransactionGraphVertical =
  | TransactionGraphAccountVertical
  | TransactionGraphApplicationVertical
  | TransactionGraphAssetVertical
  | { type: 'Placeholder' }
