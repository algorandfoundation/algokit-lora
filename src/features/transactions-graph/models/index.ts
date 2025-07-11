import { InnerTransaction, Transaction } from '@/features/transactions/models'
import { Address } from '@/features/accounts/data/types'
import { ApplicationId } from '@/features/applications/data/types'
import { AssetId } from '@/features/assets/data/types'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { AssetSummary } from '@/features/assets/models'

export type TransactionsGraphData = {
  horizontals: Horizontal[]
  verticals: Vertical[]
  filename: string
}

export type Horizontal = {
  ancestors: Horizontal[]
  transaction: Transaction | InnerTransaction
  representation: Representation
  hasNextSibling: boolean
  depth: number
  isSubHorizontal: boolean
}

export type Representation = Vector | SelfLoop | Point

export enum RepresentationType {
  Vector = 'Vector',
  SelfLoop = 'SelfLoop',
  Point = 'Point',
}

export enum LabelType {
  Payment = 'Payment',
  PaymentTransferRemainder = 'PaymentTransferRemainder',
  AssetTransfer = 'AssetTransfer',
  AssetTransferRemainder = 'AssetTransferRemainder',
  AppCall = 'AppCall',
  AppCreate = 'AppCreate',
  AppUpdate = 'AppUpdate',
  AssetCreate = 'AssetCreate',
  AssetReconfigure = 'AssetReconfigure',
  AssetDestroy = 'AssetDestroy',
  AssetFreeze = 'AssetFreeze',
  KeyReg = 'KeyReg',
  StateProof = 'StateProof',
  Clawback = 'Clawback',
  Heartbeat = 'Heartbeat',
}

export type Label =
  | {
      type: LabelType.Payment
      amount: AlgoAmount
    }
  | {
      type: LabelType.PaymentTransferRemainder
      amount: AlgoAmount
    }
  | {
      type: LabelType.AssetTransfer
      asset: AsyncMaybeAtom<AssetSummary>
      amount: number | bigint
    }
  | {
      type: LabelType.AssetTransferRemainder
      asset: AsyncMaybeAtom<AssetSummary>
      amount: number | bigint
    }
  | { type: LabelType.Clawback; asset: AsyncMaybeAtom<AssetSummary>; amount: number | bigint }
  | { type: LabelType.AppCall }
  | { type: LabelType.AppCreate }
  | { type: LabelType.AppUpdate }
  | { type: LabelType.AssetCreate }
  | { type: LabelType.AssetReconfigure }
  | { type: LabelType.AssetDestroy }
  | { type: LabelType.AssetFreeze }
  | { type: LabelType.KeyReg }
  | { type: LabelType.StateProof }
  | { type: LabelType.Heartbeat }

export type MarkerTag = number | 'Rekey'

export type Vector = {
  type: RepresentationType.Vector
  label: Label
  fromVerticalIndex: number
  fromTag?: MarkerTag
  toTag?: MarkerTag
  toVerticalIndex: number
  direction: 'leftToRight' | 'rightToLeft'
}

export type SelfLoop = {
  type: RepresentationType.SelfLoop
  label: Label
  fromVerticalIndex: number
  fromTag?: MarkerTag
  toTag?: MarkerTag
}

export type Point = {
  type: RepresentationType.Point
  label: Label
  fromVerticalIndex: number
  fromTag?: MarkerTag
}

type AssociatedAccount = {
  accountNumber: number
  accountAddress: Address
}

type ClawbackAssociatedAccount = AssociatedAccount & {
  type: 'Clawback'
}

type RekeyAssociatedAccount = AssociatedAccount & {
  type: 'Rekey'
}

export type AccountVertical = {
  id: number
  accountNumber: number
  type: 'Account'
  accountAddress: Address
  associatedAccounts: (ClawbackAssociatedAccount | RekeyAssociatedAccount)[]
}
export type ApplicationVertical = {
  id: number
  type: 'Application'
  applicationId: ApplicationId
  linkedAccount: { accountNumber: number; accountAddress: Address }
  associatedAccounts: (ClawbackAssociatedAccount | RekeyAssociatedAccount)[]
}
export type AssetVertical = {
  id: number
  type: 'Asset'
  assetId: AssetId
}
export type OpUpVertical = {
  id: number
  type: 'OpUp'
}
export type PlaceholderVertical = {
  id: number
  type: 'Placeholder'
}

export type Vertical = AccountVertical | ApplicationVertical | AssetVertical | OpUpVertical | PlaceholderVertical

export type RepresentationFromTo = {
  verticalId: number
  tag?: MarkerTag
}
// Fallback value, it should never happen, just to make TypeScript happy
export const fallbackFromTo: RepresentationFromTo = {
  verticalId: -1,
  tag: undefined,
}
