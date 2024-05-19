import { Address } from '@/features/accounts/data/types'
import { AssetSummary } from '@/features/assets/models'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

export type CommonTransactionProperties = {
  type: TransactionType
  confirmedRound: number
  roundTime: number
  group?: string
  fee: AlgoAmount
  sender: Address
  note?: string
  signature?: Singlesig | Multisig | Logicsig
  json: string
}

export enum TransactionType {
  Payment = 'Payment',
  AssetTransfer = 'Asset Transfer',
  ApplicationCall = 'Application Call',
  AssetConfig = 'Asset Config',
  AssetFreeze = 'Asset Freeze',
  StateProof = 'State Proof',
  KeyReg = 'Key Registration',
}

export enum AssetTransferTransactionSubType {
  OptIn = 'Opt-In',
  Clawback = 'Clawback',
  OptOut = 'Opt-Out',
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
  receiver: Address
  amount: AlgoAmount
  closeRemainder?: CloseAlgoRemainder
  subType?: undefined
}

export type PaymentTransaction = BasePaymentTransaction & {
  id: string
}

export type BaseAssetTransferTransaction = CommonTransactionProperties & {
  type: TransactionType.AssetTransfer
  subType?: AssetTransferTransactionSubType
  receiver: Address
  amount: number | bigint
  closeRemainder?: CloseAssetRemainder
  asset: AssetSummary
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

export type TransactionSummary = Pick<CommonTransactionProperties, 'type'> & {
  id: string
  from: Address
  to?: Address | number
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

export type BaseAppCallTransaction = CommonTransactionProperties & {
  type: TransactionType.ApplicationCall
  applicationId: number
  applicationArgs: string[]
  foreignApps: number[]
  foreignAssets: number[]
  applicationAccounts: Address[]
  globalStateDeltas: GlobalStateDelta[]
  localStateDeltas: LocalStateDelta[]
  innerTransactions: InnerTransaction[]
  subType?: undefined
  onCompletion: AppCallOnComplete
  action: 'Create' | 'Call'
  logs: string[]
}

export type AppCallTransaction = BaseAppCallTransaction & {
  id: string
}

export enum AppCallOnComplete {
  NoOp = 'NoOp',
  OptIn = 'Opt-In',
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

export type BaseAssetConfigTransaction = CommonTransactionProperties & {
  type: TransactionType.AssetConfig
  assetId: number
  url?: string
  name?: string
  total?: number | bigint
  decimals?: number | bigint
  unitName?: string
  clawback?: Address
  subType: AssetConfigTransactionSubType
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
  address: Address
  assetId: number
  assetName?: string
  freezeStatus: AssetFreezeStatus
  subType?: undefined
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
  id: string
  subType?: undefined
}

export type BaseKeyRegTransaction = CommonTransactionProperties & {
  type: TransactionType.KeyReg
  nonParticipation?: boolean
  selectionParticipationKey?: string
  voteFirstValid?: number
  voteKeyDilution?: number
  voteLastValid?: number
  voteParticipationKey?: string
  subType: KeyRegTransactionSubType
}

export enum KeyRegTransactionSubType {
  Online = 'Online',
  Offline = 'Offline',
}

export type KeyRegTransaction = BaseKeyRegTransaction & {
  id: string
}

export type InnerKeyRegTransaction = BaseKeyRegTransaction & InnerTransactionId
