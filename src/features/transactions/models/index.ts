import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'
import { AssetSummary } from '@/features/assets/models'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { GroupId } from '@/features/groups/data/types'
import { Atom } from 'jotai/index'
import { AbiMethod } from '@/features/abi-methods/models'

export type CommonTransactionProperties = {
  type: TransactionType
  confirmedRound: number
  roundTime: number
  group?: GroupId
  fee: AlgoAmount
  sender: Address
  note?: string
  signature?: Singlesig | Multisig | Logicsig
  json: string
  rekeyTo?: Address
}

export enum TransactionType {
  Payment = 'Payment',
  AssetTransfer = 'Asset Transfer',
  AppCall = 'Application Call',
  AssetConfig = 'Asset Config',
  AssetFreeze = 'Asset Freeze',
  StateProof = 'State Proof',
  KeyReg = 'Key Registration',
}

export enum AssetTransferTransactionSubType {
  OptIn = 'Opt-in',
  Clawback = 'Clawback',
  OptOut = 'Opt-out',
}

export type CloseAlgoRemainder = {
  to: Address
  amount: AlgoAmount
}

export type CloseAssetRemainder = {
  to: Address
  amount: number | bigint
}

export type BasePaymentTransaction = CommonTransactionProperties & {
  type: TransactionType.Payment
  subType: undefined
  receiver: Address
  amount: AlgoAmount
  closeRemainder?: CloseAlgoRemainder
}

export type PaymentTransaction = BasePaymentTransaction & {
  id: string
}

export type BaseAssetTransferTransaction = CommonTransactionProperties & {
  type: TransactionType.AssetTransfer
  subType: AssetTransferTransactionSubType | undefined
  receiver: Address
  amount: number | bigint
  closeRemainder?: CloseAssetRemainder
  assetId: AssetId
  asset: AsyncMaybeAtom<AssetSummary>
  clawbackFrom?: Address
}

export type AssetTransferTransaction = BaseAssetTransferTransaction & {
  id: string
}

export type Transaction =
  | PaymentTransaction
  | AssetTransferTransaction
  | AppCallTransaction
  | AssetConfigTransaction
  | AssetFreezeTransaction
  | StateProofTransaction
  | KeyRegTransaction

export type TransactionSummary = Pick<CommonTransactionProperties, 'type' | 'fee'> & {
  id: string
  from: Address
  to?: Address | number
  innerTransactions?: TransactionSummary[]
}

export enum SignatureType {
  Single = 'Single',
  Multi = 'Multi',
  Logic = 'Logic',
}

export type Singlesig = {
  type: SignatureType.Single
  signer: Address
}

export type Multisig = {
  type: SignatureType.Multi
  version: number
  threshold: number
  subsigners: Address[]
}

export type Logicsig = {
  type: SignatureType.Logic
  logic: string
}

export type GlobalStateDelta = {
  key: string
  type: 'Bytes' | 'Uint'
  action: 'Set' | 'Delete'
  value: string
}

export type LocalStateDelta = {
  address: Address
  key: string
  type: 'Bytes' | 'Uint'
  action: 'Set' | 'Delete'
  value: string
}

export enum AppCallTransactionSubType {
  Create = 'Create',
}

export type BaseAppCallTransaction = CommonTransactionProperties & {
  type: TransactionType.AppCall
  subType: AppCallTransactionSubType | undefined
  isOpUp: boolean
  applicationId: number
  applicationArgs: string[]
  foreignApps: number[]
  foreignAssets: number[]
  applicationAccounts: Address[]
  globalStateDeltas: GlobalStateDelta[]
  localStateDeltas: LocalStateDelta[]
  innerTransactions: InnerTransaction[]
  onCompletion: AppCallOnComplete
  logs: string[]
  abiMethod: Atom<Promise<AbiMethod | undefined>>
}

export type AppCallTransaction = BaseAppCallTransaction & {
  id: string
}

export enum AppCallOnComplete {
  NoOp = 'NoOp',
  OptIn = 'Opt-in',
  CloseOut = 'Close Out',
  ClearState = 'Clear State',
  Update = 'Update',
  Delete = 'Delete',
}

export type InnerTransactionId = {
  networkTransactionId: string
  id: string
  innerId: string
}

export type InnerPaymentTransaction = BasePaymentTransaction & InnerTransactionId
export type InnerAssetTransferTransaction = BaseAssetTransferTransaction & InnerTransactionId
export type InnerAppCallTransaction = BaseAppCallTransaction & InnerTransactionId
export type InnerTransaction =
  | InnerPaymentTransaction
  | InnerAssetTransferTransaction
  | InnerAppCallTransaction
  | InnerAssetConfigTransaction
  | InnerAssetFreezeTransaction
  | InnerKeyRegTransaction
  | InnerStateProofTransaction

export type BaseAssetConfigTransaction = CommonTransactionProperties & {
  type: TransactionType.AssetConfig
  subType: AssetConfigTransactionSubType
  assetId: number
  url?: string
  name?: string
  total?: number | bigint
  decimals?: number | bigint
  unitName?: string
  clawback?: Address
  manager?: Address
  reserve?: Address
  freeze?: Address
  defaultFrozen?: boolean
}

export type AssetConfigTransaction = BaseAssetConfigTransaction & {
  id: string
}

export type InnerAssetConfigTransaction = BaseAssetConfigTransaction & InnerTransactionId

export enum AssetConfigTransactionSubType {
  Create = 'Create',
  Reconfigure = 'Reconfigure',
  Destroy = 'Destroy',
}

export type BaseAssetFreezeTransaction = CommonTransactionProperties & {
  type: TransactionType.AssetFreeze
  subType: undefined
  address: Address
  assetId: number
  asset: AsyncMaybeAtom<AssetSummary>
  freezeStatus: AssetFreezeStatus
}

export type AssetFreezeTransaction = BaseAssetFreezeTransaction & {
  id: string
}

export type InnerAssetFreezeTransaction = BaseAssetFreezeTransaction & InnerTransactionId

export enum AssetFreezeStatus {
  Frozen = 'Frozen',
  Unfrozen = 'Unfrozen',
}

export type StateProofTransaction = CommonTransactionProperties & {
  type: TransactionType.StateProof
  subType: undefined
  id: string
}

export type InnerStateProofTransaction = Omit<StateProofTransaction, 'id'> & InnerTransactionId

export type BaseKeyRegTransaction = CommonTransactionProperties & {
  type: TransactionType.KeyReg
  subType: KeyRegTransactionSubType
  nonParticipation?: boolean
  selectionParticipationKey?: string
  voteFirstValid?: number
  voteKeyDilution?: number
  voteLastValid?: number
  voteParticipationKey?: string
  stateProofKey?: string
}

export enum KeyRegTransactionSubType {
  Online = 'Online',
  Offline = 'Offline',
}

export type KeyRegTransaction = BaseKeyRegTransaction & {
  id: string
}

export type InnerKeyRegTransaction = BaseKeyRegTransaction & InnerTransactionId
