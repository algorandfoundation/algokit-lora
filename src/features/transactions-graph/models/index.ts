import { InnerTransaction, Transaction } from '@/features/transactions/models'

export type TransactionsGraph = {
  rows: TransactionGraphRow[]
  swimlanes: Swimlane[]
}

export type TransactionGraphRow = {
  parent?: TransactionGraphRow
  transaction: Transaction | InnerTransaction
  visualization: TransactionGraphVisualization
  nestingLevel: number
}

export type TransactionGraphVisualization = TransactionGraphVector | TransactionGraphSelfLoop | TransactionGraphPoint

export type TransactionGraphVector = {
  from: number
  to: number
  type: 'vector'
  direction: 'leftToRight' | 'rightToLeft'
}

export type TransactionGraphSelfLoop = {
  from: number
  type: 'selfLoop'
}

export type TransactionGraphPoint = {
  type: 'point'
  from: number
}

export type AccountSwimlane = {
  type: 'Account'
  address: string
}
export type ApplicationSwimlane = {
  type: 'Application'
  id: number
  address: string
  accounts: {
    address: string
  }[]
}
export type AssetSwimlane = {
  type: 'Asset'
  id: string
}
export type Swimlane = AccountSwimlane | ApplicationSwimlane | AssetSwimlane | { type: 'Placeholder' }
