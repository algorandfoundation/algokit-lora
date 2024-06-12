import { InnerTransaction, Transaction } from '@/features/transactions/models'

export type TransactionsGraphData = {
  horizontalLines: TransactionGraphHorizontalLine[]
  verticalLines: TransactionGraphVerticalLine[]
}

export type TransactionGraphHorizontalLine = {
  ancestors: TransactionGraphHorizontalLine[]
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
  from: number
  to: number
  type: 'vector'
  direction: 'leftToRight' | 'rightToLeft'
}

export type TransactionGraphSelfLoopVisualization = {
  from: number
  type: 'selfLoop'
}

export type TransactionGraphPointVisualization = {
  type: 'point'
  from: number
}

export type TransactionGraphAccountVerticalLine = {
  type: 'Account'
  address: string
}
export type TransactionGraphApplicationVerticalLine = {
  type: 'Application'
  id: number
  address: string //TODO: use Address type
  accounts: {
    address: string
  }[]
}
export type TransactionGraphAssetVerticalLine = {
  type: 'Asset'
  id: string
}
export type TransactionGraphVerticalLine =
  | TransactionGraphAccountVerticalLine
  | TransactionGraphApplicationVerticalLine
  | TransactionGraphAssetVerticalLine
  | { type: 'Placeholder' }
