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

  base64Note?: string
  textNote?: string
  messagePackNote?: string

  signature?: SinglesigModel | MultisigModel | LogicsigModel
}

export enum TransactionType {
  Payment = 'Payment',
}

export type PaymentTransactionModel = CommonTransactionProperties & {
  type: TransactionType.Payment
  receiver: Address
  amount: AlgoAmount
  closeAmount?: AlgoAmount
}

export type TransactionModel = PaymentTransactionModel

export type MicroAlgo = number

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
