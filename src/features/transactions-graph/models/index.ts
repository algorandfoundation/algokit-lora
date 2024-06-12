import { AppCallTransaction, InnerAppCallTransaction, InnerTransaction, Transaction } from '@/features/transactions/models'

export type TransactionsGraph = {
  transactions: Transaction[]
  rows: TransactionGraphRow[]
  swimlanes: Swimlane[]
}

export type TransactionGraphRow = {
  parent?: AppCallTransaction | InnerAppCallTransaction
  hasNextSibling: boolean
  hasChildren: boolean
  transaction: Transaction | InnerTransaction
  visualization: TransactionGraphVisualization
  nestingLevel: number
  verticalBars: (number | undefined)[]
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

export const colors = [
  'rgb(255, 99, 132)',
  'rgb(54, 162, 235)',
  'rgb(255, 206, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(255, 21, 132)',
  'rgb(123, 159, 199)',
  'rgb(23, 88, 132)',
  'rgb(123, 11, 132)',
  'rgb(11, 132, 132)',
  'rgb(11, 11, 132)',
  'rgb(99, 99, 132)',
]
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
    color: string
  }[]
}
export type AssetSwimlane = {
  type: 'Asset'
  id: string
}
export type Swimlane = AccountSwimlane | ApplicationSwimlane | AssetSwimlane | { type: 'Placeholder' }

export const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]
