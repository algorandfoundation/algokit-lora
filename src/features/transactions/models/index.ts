import { Asset } from '@/features/assets/models'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

type Address = string

export type CommonTransactionProperties = {
  type: TransactionType
  confirmedRound: number
  roundTime: number
  group?: string
  fee: AlgoAmount
  sender: Address
  note?: string
  signature?: SinglesigModel | MultisigModel | LogicsigModel
  json: string
}

export enum TransactionType {
  Payment = 'Payment',
  AssetTransfer = 'Asset Transfer',
  ApplicationCall = 'Application Call',
  AssetConfig = 'Asset Config',
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

export type BasePaymentTransactionModel = CommonTransactionProperties & {
  type: TransactionType.Payment
  receiver: Address
  amount: AlgoAmount
  closeRemainder?: CloseAlgoRemainder
  subType?: undefined
}

export type PaymentTransactionModel = BasePaymentTransactionModel & {
  id: string
}

export type BaseAssetTransferTransactionModel = CommonTransactionProperties & {
  type: TransactionType.AssetTransfer
  subType?: AssetTransferTransactionSubType
  receiver: Address
  amount: number | bigint
  closeRemainder?: CloseAssetRemainder
  asset: Asset
  clawbackFrom?: Address
}

export type AssetTransferTransactionModel = BaseAssetTransferTransactionModel & {
  id: string
}

export type TransactionModel =
  | PaymentTransactionModel
  | AssetTransferTransactionModel
  | AppCallTransactionModel
  | AssetConfigTransactionModel

export type TransactionSummary = Pick<CommonTransactionProperties, 'type'> & {
  id: string
  from: Address
  to: Address | number
}

export enum SignatureType {
  Single = 'Single',
  Multi = 'Multi',
  Logic = 'Logic',
}

export type SinglesigModel = {
  type: SignatureType.Single
  signer: Address
}

export type MultisigModel = {
  type: SignatureType.Multi
  version: number
  threshold: number
  subsigners: Address[]
}

export type LogicsigModel = {
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

export type BaseAppCallTransactionModel = CommonTransactionProperties & {
  type: TransactionType.ApplicationCall
  applicationId: number
  applicationArgs: string[]
  foreignApps: number[]
  foreignAssets: number[]
  applicationAccounts: Address[]
  globalStateDeltas: GlobalStateDelta[]
  localStateDeltas: LocalStateDelta[]
  innerTransactions: InnerTransactionModel[]
  subType?: undefined
  onCompletion: AppCallOnComplete
  action: 'Create' | 'Call'
  logs: string[]
}

export type AppCallTransactionModel = BaseAppCallTransactionModel & {
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
  id: string
  innerId: string
}

export type InnerPaymentTransactionModel = BasePaymentTransactionModel & InnerTransactionId
export type InnerAssetTransferTransactionModel = BaseAssetTransferTransactionModel & InnerTransactionId
export type InnerAppCallTransactionModel = BaseAppCallTransactionModel & InnerTransactionId
export type InnerTransactionModel =
  | InnerPaymentTransactionModel
  | InnerAssetTransferTransactionModel
  | InnerAppCallTransactionModel
  | InnerAssetConfigTransactionModel

export type BaseAssetConfigTransactionModel = CommonTransactionProperties & {
  type: TransactionType.AssetConfig
  assetId: number
  url?: string
  name?: string
  total?: number | bigint
  decimals?: number | bigint
  unitName?: string
  clawback?: string
  subType: AssetConfigTransactionSubType
  manager?: string
  reserve?: string
  freeze?: string
  defaultFrozen?: boolean
}

export type AssetConfigTransactionModel = BaseAssetConfigTransactionModel & {
  id: string
}

export type InnerAssetConfigTransactionModel = BaseAssetConfigTransactionModel & InnerTransactionId

export enum AssetConfigTransactionSubType {
  Create = 'Create',
  Reconfigure = 'Reconfigure',
  Destroy = 'Destroy',
}
