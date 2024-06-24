import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { Address } from '@/features/accounts/data/types'
import { ApplicationId } from '@/features/applications/data/types'
import { AssetId } from '@/features/assets/data/types'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { AssetSummary } from '@/features/assets/models'

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

export enum TransactionGraphVisualizationShape {
  Vector = 'Vector',
  SelfLoop = 'SelfLoop',
  Point = 'Point',
}

export enum TransactionGraphVisualizationType {
  Payment = 'Payment',
  PaymentCloseOut = 'Payment Close Out',
  AssetTransfer = 'Asset Transfer',
  ApplicationCall = 'App Call',
  AssetConfig = 'Asset Config',
  AssetFreeze = 'Asset Freeze',
  KeyReg = 'Key Reg',
  StateProof = 'State Proof',
  Clawback = 'Clawback',
  // TODO: app create
}

export type TransactionGraphVisualizationDescription =
  | {
      type: TransactionGraphVisualizationType.Payment
      amount: AlgoAmount
    }
  | {
      type: TransactionGraphVisualizationType.PaymentCloseOut
      amount: AlgoAmount
    }
  | {
      type: TransactionGraphVisualizationType.AssetTransfer
      asset: AsyncMaybeAtom<AssetSummary>
      amount: number | bigint
    }
  | { type: TransactionGraphVisualizationType.Clawback }
  | { type: TransactionGraphVisualizationType.ApplicationCall }
  | { type: TransactionGraphVisualizationType.AssetConfig }
  | { type: TransactionGraphVisualizationType.AssetFreeze }
  | { type: TransactionGraphVisualizationType.KeyReg }
  | { type: TransactionGraphVisualizationType.StateProof }

export type TransactionGraphVectorVisualization = {
  shape: TransactionGraphVisualizationShape.Vector
  description: TransactionGraphVisualizationDescription
  fromVerticalIndex: number
  fromAccountIndex?: number
  toAccountIndex?: number
  toVerticalIndex: number
  direction: 'leftToRight' | 'rightToLeft'
}

export type TransactionGraphSelfLoopVisualization = {
  shape: TransactionGraphVisualizationShape.SelfLoop
  description: TransactionGraphVisualizationDescription
  fromVerticalIndex: number
  fromAccountIndex?: number
}

export type TransactionGraphPointVisualization = {
  shape: TransactionGraphVisualizationShape.Point
  description: TransactionGraphVisualizationDescription
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
