import { AssetModel } from '@/features/assets/models'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

type Address = string

type CommonTransactionProperties = {
  id: string
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

export type PaymentTransactionModel = CommonTransactionProperties & {
  type: TransactionType.Payment
  receiver: Address
  amount: AlgoAmount
  closeRemainder?: CloseAlgoRemainder
  subType?: undefined
}

export type AssetTransferTransactionModel = CommonTransactionProperties & {
  type: TransactionType.AssetTransfer
  subType?: AssetTransferTransactionSubType
  receiver: Address
  amount: number | bigint
  closeRemainder?: CloseAssetRemainder
  asset: AssetModel
  clawbackFrom?: Address
}

export type TransactionModel = PaymentTransactionModel | AssetTransferTransactionModel | AppCallTransactionModel

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

export type StateDelta = {
  key: string
  type: 'Bytes' | 'Uint'
  action: 'Set' | 'Delete'
  value: string
}

export type AppCallTransactionModel = CommonTransactionProperties & {
  type: TransactionType.ApplicationCall
  applicationId: number
  applicationArgs: string[]
  foreignApps: number[]
  foreignAssets: number[]
  applicationAccounts: Address[]
  globalStateDeltas: StateDelta[]
  // TODO: test this
  localStateDeltas: StateDelta[]
  innerTransactions: TransactionModel[]
  subType?: undefined
  onCompletion: AppCallOnComplete
  action: 'Create' | 'Call'
}

export enum AppCallOnComplete {
  NoOp = 'NoOp',
  OptIn = 'Opt-In',
  CloseOut = 'Close Out',
  ClearState = 'Clear State',
  Update = 'Update',
  Delete = 'Delete',
}
