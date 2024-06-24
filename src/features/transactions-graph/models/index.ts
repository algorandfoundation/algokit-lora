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
  visualization: TransactionGraphVisualization
  hasNextSibling: boolean
  depth: number
  isSubHorizontal: boolean
}

export type TransactionGraphVisualization = TransactionGraphVector | TransactionGraphSelfLoop | TransactionGraphPoint

export enum TransactionGraphVisualizationType {
  Vector = 'Vector',
  SelfLoop = 'SelfLoop',
  Point = 'Point',
}

export enum TransactionGraphVisualizationDescriptionType {
  Payment = 'Payment',
  PaymentCloseOut = 'Payment Close Out',
  AssetTransfer = 'Asset Transfer',
  ApplicationCall = 'App Call',
  AssetConfig = 'Asset Config',
  AssetFreeze = 'Asset Freeze',
  KeyReg = 'Key Reg',
  StateProof = 'State Proof',
  Clawback = 'Clawback',
  AssetCloseOut = 'AssetCloseOut',
}

export type TransactionGraphVisualizationDescription =
  | {
      type: TransactionGraphVisualizationDescriptionType.Payment
      amount: AlgoAmount
    }
  | {
      type: TransactionGraphVisualizationDescriptionType.PaymentCloseOut
      amount: AlgoAmount
    }
  | {
      type: TransactionGraphVisualizationDescriptionType.AssetTransfer
      asset: AsyncMaybeAtom<AssetSummary>
      amount: number | bigint
    }
  | {
      type: TransactionGraphVisualizationDescriptionType.AssetCloseOut
      asset: AsyncMaybeAtom<AssetSummary>
      amount: number | bigint
    }
  | { type: TransactionGraphVisualizationDescriptionType.Clawback }
  | { type: TransactionGraphVisualizationDescriptionType.ApplicationCall }
  | { type: TransactionGraphVisualizationDescriptionType.AssetConfig }
  | { type: TransactionGraphVisualizationDescriptionType.AssetFreeze }
  | { type: TransactionGraphVisualizationDescriptionType.KeyReg }
  | { type: TransactionGraphVisualizationDescriptionType.StateProof }

export type TransactionGraphVector = {
  shape: TransactionGraphVisualizationType.Vector
  description: TransactionGraphVisualizationDescription
  fromVerticalIndex: number
  fromAccountIndex?: number
  toAccountIndex?: number
  toVerticalIndex: number
  direction: 'leftToRight' | 'rightToLeft'
}

export type TransactionGraphSelfLoop = {
  shape: TransactionGraphVisualizationType.SelfLoop
  description: TransactionGraphVisualizationDescription
  fromVerticalIndex: number
  fromAccountIndex?: number
}

export type TransactionGraphPoint = {
  shape: TransactionGraphVisualizationType.Point
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
