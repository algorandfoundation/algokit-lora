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
  transactions?: TransactionModel[]
  signature?: SinglesigModel | MultisigModel | LogicsigModel
}

export enum TransactionType {
  Payment = 'Payment',
  AssetTransfer = 'Asset Transfer',
}

export enum AssetTransferTransactionSubType {
  Transaction = 'Transaction',
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
}

export type AssetTransferTransactionModel = CommonTransactionProperties & {
  type: TransactionType.AssetTransfer
  subType: AssetTransferTransactionSubType
  receiver: Address
  amount: number | bigint
  closeRemainder?: CloseAssetRemainder
  asset: AssetModel
  clawbackFrom?: Address
}

export type TransactionModel = PaymentTransactionModel | AssetTransferTransactionModel

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
